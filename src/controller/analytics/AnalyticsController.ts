import BaseController from "@controller/BaseController";
import { Response } from "express";
import { get, controller, use, post } from "@deep/routing/decorators";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { body, param } from "express-validator";
import typeOrNull from "@service/utils/typeOrNull";
import CustomRequest from "@root/service/core/express/CustomRequest";
import Analytics from "@root/service/core/analytics/Analytics";
import { validateCampaign } from "../core/helpers/validateCampaign";
import { validatePerimeter } from "../core/helpers/validatePerimeter";

@controller("/analytics")
class AnalyticsController extends BaseController{
    @use([
        body("eventName")
            .exists()
            .custom((value) => typeOrNull("string", value)), 
        expressValidatorThrower
    ])
    @post("")
    async setAnalytics(req: CustomRequest, res: Response){
        const { eventName, campaignId } = req.body;
        const user = await this.getUser(req, ["company"]);
        const campaign = await validateCampaign(campaignId, user!);
        
        const perimeter = await validatePerimeter(campaign.perimeterId, user!);

        const analytics = new Analytics(eventName);

        await analytics.addAnalytic(user, campaign, perimeter);

        res.status(200).send({analytics});
    }

    @use([
        body("eventName")
            .exists()
            .custom((value) => typeOrNull("string", value)), 
        expressValidatorThrower
    ])
    @post("/logged")
    async setAnalyticsUserLogged(req: CustomRequest, res: Response){
        const { eventName } = req.body;
        const user = await this.getUser(req, ["company"]);

        const analytics = new Analytics(eventName);

        await analytics.addAnalytic(user);

        res.status(200).send({analytics});
    }
}
import { Response } from "express";
import { get, post, put, del, controller, use } from "@deep/routing/decorators";
import { body, param, query } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { activityManager, campaignManager } from "@manager/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { classToPlain } from "class-transformer";
import { validateCampaign } from "@controller/core/helpers/validateCampaign";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";
import Analytics from "@root/service/core/analytics/Analytics";
import { validatePerimeter } from "../core/helpers/validatePerimeter";

@controller("")
class ActivityController extends BaseController {
  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/campaigns/:id/activities")
  async getActivities(req: CustomRequest, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(id, user!);
    const perimeter = await validatePerimeter(campaign.perimeterId, user!);

    await PerimeterAccessControl.buildFor(
      user,
      campaign.perimeter
    ).requireContributor();

    const activities = await activityManager
      .getRepository()
      .findAllForCampaign(campaign.id, user?.locale ?? undefined);

    const analytics = new Analytics(`view_campaign`);
    analytics.addAnalytic(user, campaign, perimeter);

    res.send(
      classToPlain(activities, {
        groups: [
          "activity_with_activity_model",
          "activity_model_short",
          "activity_with_owner",
        ],
      })
    );
  }

  @use([
    query("campaignIds").exists(), expressValidatorThrower
  ])
  @get("/activities")
  async getActivitiesForMultipleCampaigns(req: CustomRequest, res: Response) {
    const campaignIds = (req.query.campaignIds as string).split(',').map(Number);
    const user = await this.getUser(req, ["company"]);
    
    for (let i = 0; i < campaignIds.length; i++) {
      const campaignId = campaignIds[i];
      await validateCampaign(campaignId, user!);
    }

    const campaigns = await campaignManager.getRepository().findWithActivities(campaignIds, user?.locale ?? undefined);

    res.send(
      classToPlain(campaigns, {
        groups: [
          "campaign_with_activities",
          "activity_with_activity_model",
          "activity_model_short",
          "activity_with_owner",
        ],
      })
    );
  }
}

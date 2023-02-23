import { Response } from "express";
import CustomRequest from "@service/core/express/CustomRequest";
import { body, param } from "express-validator";
import BaseController from "@controller/BaseController";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { get, controller, post, use, del } from "@deep/routing/decorators";
import { trajectoryManager } from "@manager/index";
import { validateCampaign } from "@controller/core/helpers/validateCampaign";
import { classToClass, classToClassFromExist, classToPlain, classToPlainFromExist, plainToClass } from "class-transformer";
import { validateTrajectory } from "@controller/trajectory/helpers/validateTrajectory";
import { SCOPE } from "@entity/enum/Scope";
import typeOrNull from "@service/utils/typeOrNull";
import { ScopeActionPlanHelp } from "@entity/index";
import { ScopeActionPlanHelpRepository } from "@root/repository";

@controller("/trajectories")
class TrajectoryController extends BaseController {
  @get("/scope-helps")
  async getScopeHelps(req: CustomRequest, res: Response) {
    const user = await this.getUser(req);
    const helps = await this.em.getCustomRepository(ScopeActionPlanHelpRepository).findAll({
      customLocale: user?.locale ?? undefined
    });

    res.send(classToPlain(helps));
  }
  
  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id")
  async getTrajectory(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const trajectory = await validateTrajectory(id, user!);

    res.send(classToPlain(trajectory));
    // res.send(trajectory);
  }

  @use([body("campaignId").exists().toInt(), expressValidatorThrower])
  @post("")
  async createTrajectory(req: CustomRequest, res: Response) {
    const campaignId = (req.body.campaignId as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(campaignId, user!);

    const trajectory = await trajectoryManager.createNew(campaign);

    res.status(201).send(classToPlain(trajectory));
  }

  @use([param("id").exists().toInt(), body(), expressValidatorThrower])
  @del("/:id")
  async deleteTrajectory(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const trajectory = await validateTrajectory(id, user!);

    await trajectoryManager.removeTrajectory(trajectory);

    res.status(204).send({});
  }

}

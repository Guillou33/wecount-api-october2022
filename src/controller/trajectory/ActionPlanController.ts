import { Response } from "express";
import CustomRequest from "@service/core/express/CustomRequest";
import { body, param } from "express-validator";
import BaseController from "@controller/BaseController";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { get, controller, post, put, use, del } from "@deep/routing/decorators";
import { actionPlanManager, trajectoryManager } from "@manager/index";
import { classToPlain } from "class-transformer";
import { validateActionPlan } from "@controller/trajectory/helpers/validateActionPlan";
import { validateTrajectory } from "@controller/trajectory/helpers/validateTrajectory";
import { validateAction } from "@controller/trajectory/helpers/validateAction";
import { validateCategory } from "@controller/trajectory/helpers/validateCategory";
import typeOrNull from "@service/utils/typeOrNull";
import { validateActivityModel } from "./helpers/validateActivityModel";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";
import { validateCampaign } from "../core/helpers/validateCampaign";

@controller("/action-plans")
class ActionPlanController extends BaseController {
  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id")
  async getActionPlan(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);

    const actionPlan = await validateActionPlan(id, user!);

    res.send(classToPlain(actionPlan));
  }

  @use([
    body("campaignTrajectoryId").exists().toInt(),
    body("categoryId").exists().toInt(),
    body("activityModelId")
      .optional()
      .custom(value => typeOrNull("number", value)),
    body("actionId")
      .optional()
      .custom(value => typeOrNull("number", value)),
    body("reduction")
      .optional()
      .custom(value => typeOrNull("number", value)),
    body("description")
      .optional()
      .custom(value => typeOrNull("string", value)),
    body("comments")
      .optional()
      .custom(value => typeOrNull("string", value)),
    expressValidatorThrower,
  ])
  @post("")
  async createActionPlan(req: CustomRequest, res: Response) {
    const {
      campaignTrajectoryId: trajectoryIdRaw,
      actionId: actionIdRaw,
      categoryId: categoryIdRaw,
      activityModelId: activityModelIdRaw,
      ...data
    } = req.body;
    const trajectoryId = (trajectoryIdRaw as unknown) as number;
    const actionId = (actionIdRaw as unknown) as number;
    const categoryId = (categoryIdRaw as unknown) as number;
    const activityModelId = (activityModelIdRaw as unknown) as number;

    const user = await this.getUser(req, ["company"]);
    const trajectory = await validateTrajectory(trajectoryId, user!);

    await PerimeterAccessControl.buildFor(user, trajectory.campaign.perimeter).requireManager();

    const [
      action, 
      category, 
      activityModel
    ] = await Promise.all([
      validateAction(actionId),
      validateCategory(categoryId, user?.locale ?? undefined),
      validateActivityModel(activityModelId, user?.locale ?? undefined),
    ]);
    
    const actionPlan = await actionPlanManager.createNew(
      trajectory,
      category,
      action,
      activityModel,
      data,
    );

    res.send(classToPlain(actionPlan));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @del("/:id")
  async removeActionPlan(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const actionPlan = await validateActionPlan(id, user!);

    const trajectory = actionPlan.campaignTrajectory;
    const campaign = await validateCampaign(trajectory.campaignId, user!);

    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireManager();

    await actionPlanManager.getRepository().removeActionPlan(actionPlan);

    res.status(204).send({});
  }

  @use([
    param("id").exists().toInt(),
    body("actionId")
      .exists()
      .custom(value => typeOrNull("number", value)),
    body("reduction")
      .exists()
      .custom(value => typeOrNull("number", value)),
    body("description")
      .exists()
      .custom(value => typeOrNull("string", value)),
    body("comments")
      .exists()
      .custom(value => typeOrNull("string", value)),
    expressValidatorThrower,
  ])
  @put("/:id")
  async updateActionPlan(req: CustomRequest, res: Response) {
    
    const { actionId: actionIdRaw, ...data } = req.body;
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const actionPlan = await validateActionPlan(id, user!);
    const action = await validateAction(actionIdRaw);

    const trajectory = actionPlan.campaignTrajectory;
    const campaign = await validateCampaign(trajectory.campaignId, user!);

    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireManager();

    const updatedActionPlan = await actionPlanManager.update(
      actionPlan,
      action,
      data
    );

    res.status(200).send(classToPlain(updatedActionPlan));
  }
}

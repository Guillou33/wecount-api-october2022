import { Response } from "express";
import CustomRequest from "@service/core/express/CustomRequest";
import { body, param } from "express-validator";
import BaseController from "@controller/BaseController";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { get, controller, post, put, use, del } from "@deep/routing/decorators";
import { actionPlanManager } from "@manager/index";
import { classToPlain } from "class-transformer";
import { validateIndicator } from "@controller/indicator/helpers/validateIndcator";
import typeOrNull from "@service/utils/typeOrNull";
import { validateCampaign } from "@controller/core/helpers/validateCampaign";
import { indicatorManager } from "@manager/index";

@controller("/indicators")
class ActionPlanController extends BaseController {
  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id")
  async getIndicator(req: CustomRequest, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);

    const indicator = await validateIndicator(id, user!);

    res.send(classToPlain(indicator));
  }

  @use([
    body("campaignId").exists().toInt(),
    body("name").isString(),
    body("unit")
      .optional()
      .custom(value => typeOrNull("string", value)),
    body("quantity")
      .optional()
      .custom(value => typeOrNull("number", value)),
    expressValidatorThrower,
  ])
  @post("")
  async createIndicator(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const { campaignId, name, unit, quantity } = req.body;
    const campaign = await validateCampaign(campaignId as number, user!);

    const indicatorInfo = {
      name: name as string,
      unit: unit as string | null,
      quantity: quantity as number | null,
      campaign,
    };

    const indicator = await indicatorManager.createNew(indicatorInfo);

    res.send(classToPlain(indicator));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @del("/:id")
  async deleteIndicator(req: CustomRequest, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);

    const indicator = await validateIndicator(id, user!);

    await indicatorManager.delete(indicator);

    res.status(204).send();
  }

  @use([
    param("id").exists().toInt(),
    body("name").isString(),
    body("unit").custom(value => typeOrNull("string", value)),
    body("quantity").custom(value => typeOrNull("number", value)),

    expressValidatorThrower,
  ])
  @put("/:id")
  async updateIndicator(req: CustomRequest, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const { name, unit, quantity } = req.body;
    const indicator = await validateIndicator(id, user!);

    const indicatorInfo = {
      name: name as string,
      unit: unit as string | null,
      quantity: quantity as number | null,
    };

    const indicatorUpdated = await indicatorManager.update(
      indicator,
      indicatorInfo
    );

    res.send(classToPlain(indicatorUpdated));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/campaigns/:id")
  async getCampaignIndicator(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(id, user!);

    const indicators = await indicatorManager.findAllForCampaign(campaign);

    res.send(classToPlain(indicators));
  }
}

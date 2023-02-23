import { Response } from "express";
import { classToPlain } from "class-transformer";
import { param } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";

import { get, controller, use } from "@deep/routing/decorators";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import {
  ReglementationTableCode,
  getReglementationTableCode,
} from "@root/entity/enum/ReglementationTableCode";
import { validateCampaign } from "@root/controller/core/helpers/validateCampaign";
import { validatePerimeter } from "@controller/core/helpers/validatePerimeter";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";

import getActivityEntryResultManager from "@root/service/reglementationTable/getActivityEntryResultManager";
import { reglementationTableManager } from "@root/manager";

@controller("/reglementation-tables")
class ReglementationTable extends BaseController {
  @get("/structure")
  async getReglementationTables(req: CustomRequest, res: Response) {
    const user = await this.getUser(req);
    const structure = await reglementationTableManager.getAllTablesStructure({
      customLocale: user?.locale ?? undefined,
    });
    res.send(
      classToPlain({
        structure,
      })
    );
  }
  @use([
    param("campaignId").exists().isInt(),
    param("tableCode")
      .exists()
      .isString()
      .custom(value => Object.values(ReglementationTableCode).includes(value)),
    expressValidatorThrower,
  ])
  @get("/campaign-data/:campaignId/:tableCode")
  async getCampaignData(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(
      Number(req.params.campaignId),
      user!
    );
    const perimeter = await validatePerimeter(campaign.perimeterId, user!);
    await PerimeterAccessControl.buildFor(
      user,
      perimeter
    ).requireCollaborator();

    const tableCode = getReglementationTableCode(req.params.tableCode);

    const resultManager = getActivityEntryResultManager(tableCode);

    const results = await resultManager.getResultsOfCampaign(campaign.id);

    res.send({ activityEntryResults: classToPlain(results) });
  }
}

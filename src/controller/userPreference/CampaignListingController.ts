import { Response } from "express";
import { param, body } from "express-validator";
import { get, controller, use, post } from "@deep/routing/decorators";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { validateCampaign } from "@controller/core/helpers/validateCampaign";
import campaignListingManager from "@manager/userPreference/CampaignListingManager";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import validateColumns from "./helpers/validateColumns";

@controller("/userPreferences/campaignListing")
export class CampaignListingController extends BaseController {
  @use([param("campaignId").exists().toInt(), expressValidatorThrower])
  @get("/:campaignId")
  async getCampaignListingPreferences(req: CustomRequest, res: Response) {
    const campaignId = (req.params.campaignId as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(campaignId, user!);
    const visibleColumns = await campaignListingManager.getVisibleColumnsFor(
      user!,
      campaign
    );
    res.send({
      columns: visibleColumns,
    });
  }

  @use([
    param("campaignId").exists().toInt(),
    body("columns").exists().isArray(),
    expressValidatorThrower,
  ])
  @post("/:campaignId")
  async updateCampaignListingPreferences(req: CustomRequest, res: Response) {
    const campaignId = (req.params.campaignId as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(campaignId, user!);
    const columns = validateColumns(req.body.columns);

    const newPreferences = await campaignListingManager.upsertVisibleColumns(
      user!,
      campaign,
      columns
    );
    res.send({
      columns: newPreferences.visibleColumns.map(
        column => column.listingColumn
      ),
    });
  }
}

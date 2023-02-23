import { CampaignListingPreference } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(CampaignListingPreference)
export class CampaignListingRepository extends Repository<CampaignListingPreference> {
  async findVisibleColumnsForUserAndCampaign(
    userId: number,
    campaignId: number
  ): Promise<CampaignListingPreference | undefined> {
    const queryBuilder = this.createQueryBuilder("lvc")
      .innerJoin("lvc.user", "user")
      .innerJoin("lvc.campaign", "campaign")
      .innerJoinAndSelect("lvc.visibleColumns", "visibleColumns")
      .where("user.id = :userId", { userId })
      .andWhere("campaign.id = :campaignId", { campaignId });
    return queryBuilder.getOne();
  }

  async findCampaignListingPreference(
    userId: number,
    campaignId: number
  ): Promise<CampaignListingPreference | undefined> {
    const queryBuilder = this.createQueryBuilder("clp")
      .innerJoin("clp.user", "user")
      .innerJoin("clp.campaign", "campaign")
      .leftJoinAndSelect("clp.visibleColumns", "visibleColumns")
      .where("user.id = :userId", { userId })
      .andWhere("campaign.id = :campaignId", { campaignId });
    return queryBuilder.getOne();
  }
}

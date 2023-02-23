import AbstractManagerWithRepository from "@manager/AbstractManagerWithRepository";
import {
  CampaignListingPreference,
  Campaign,
  User,
  VisibleColumn,
} from "@entity/index";
import { ListingColumn } from "@entity/enum/ListingColumn";
import { CampaignListingRepository } from "@root/repository/userPreference/CampaignListingRepository";

class CampaignListingManager extends AbstractManagerWithRepository<
  CampaignListingPreference,
  CampaignListingRepository
> {
  protected entityClass = CampaignListingPreference;
  protected repositoryClass = CampaignListingRepository;

  private static defaultVisibleColumns: ListingColumn[] = Object.values(
    ListingColumn
  ).map(column => ListingColumn[column]);

  async getVisibleColumnsFor(
    user: User,
    campaign: Campaign
  ): Promise<ListingColumn[]> {
    const preferences = await this.getRepository().findVisibleColumnsForUserAndCampaign(
      user.id,
      campaign.id
    );
    if (preferences == null) {
      return CampaignListingManager.defaultVisibleColumns;
    }
    return preferences.visibleColumns.map(column => column.listingColumn);
  }

  async upsertVisibleColumns(
    user: User,
    campaign: Campaign,
    newVisibleColumnNames: ListingColumn[]
  ): Promise<CampaignListingPreference> {
    let preference = await this.getRepository().findCampaignListingPreference(
      user.id,
      campaign.id
    );
    if (preference == null) {
      preference = this.getRepository().create();
      preference.campaign = campaign;
      preference.user = user;
    } else {
      const existingColumnsDeletions = preference.visibleColumns.map(
        visibleColumn => this.em.remove(visibleColumn)
      );
      await Promise.all(existingColumnsDeletions);
    }
    const newVisibleColumns = newVisibleColumnNames.map(columnName => {
      const column = this.em.getRepository(VisibleColumn).create();
      column.listingColumn = ListingColumn[columnName];
      return column;
    });

    preference.visibleColumns = newVisibleColumns;
    await this.em.save(newVisibleColumns);
    await this.em.save(preference);
    return preference;
  }
}

export default new CampaignListingManager();

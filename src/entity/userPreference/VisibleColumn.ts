import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { CampaignListingPreference } from "@root/entity/userPreference/CampaignListingPreference";
import { ListingColumn } from "@entity/enum/ListingColumn";

@Entity()
export class VisibleColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => CampaignListingPreference,
    campaignListingPreference => campaignListingPreference.id
  )
  campaignListingPreference: CampaignListingPreference;

  @Column({ type: "enum", enum: ListingColumn })
  listingColumn: ListingColumn;
}

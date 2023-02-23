import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { Campaign } from "@entity/core/Campaign";
import { User } from "@entity/auth/User";
import { VisibleColumn } from "@entity/userPreference/VisibleColumn";

@Entity()
export class CampaignListingPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Campaign, campaign => campaign.id)
  campaign: Campaign;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @OneToMany(
    () => VisibleColumn,
    visibleColumn => visibleColumn.campaignListingPreference
  )
  visibleColumns: VisibleColumn[];
}

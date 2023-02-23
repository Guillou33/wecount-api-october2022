import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  RelationId,
  Unique,
} from "typeorm";
import { ActivityModel } from "@entity/activity/ActivityModel";
import { Campaign } from "@entity/core/Campaign";
import { ActivityEntry } from "@entity/activity/ActivityEntry";
import { Status } from '@entity/enum/Status';
import { Exclude, Expose } from 'class-transformer';
import { User } from "..";

@Exclude()
@Entity()
@Unique("UniqueByCampaignAndActivityModel", ["activityModel", "campaign", "softDeletedAt"])
export class Activity {
  @Expose({groups: ['activity_with_activity_model', 'activity_with_activity_entries']})
  @ManyToOne(() => ActivityModel, activityModel => activityModel.activities, {nullable: false})
  @JoinColumn()
  activityModel: ActivityModel;
  
  @Expose({ groups: ["with_campaign_year", "with_campaign_status"] })
  @ManyToOne(() => Campaign, campaign => campaign.activities, {nullable: false})
  @JoinColumn()
  campaign: Campaign;
  
  @Expose({groups: ['activity_with_activity_entries']})
  @OneToMany(() => ActivityEntry, activityEntry => activityEntry.activity)
  activityEntries: ActivityEntry[];

  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  softDeletedAt: Date;

  @Expose()
  @Column({ type: "enum", enum: Status, default: Status.IN_PROGRESS })
  status: Status;

  @Expose()
  @Column("float", {nullable: true})
  resultTco2: number | null;

  @Expose()
  @Column("float", {nullable: true})
  uncertainty: number | null;

}

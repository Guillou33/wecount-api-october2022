import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  RelationId,
} from "typeorm";

import { Campaign, ActionPlan } from "@entity/index";
import { Exclude, Expose } from "class-transformer";

@Entity()
export class CampaignTrajectory {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  softDeletedAt: Date;

  @Exclude()
  @ManyToOne(() => Campaign)
  campaign: Campaign;

  @RelationId((trajectory: CampaignTrajectory) => trajectory.campaign)
  campaignId: number;

  @OneToMany(() => ActionPlan, actionPlan => actionPlan.campaignTrajectory)
  actionPlans: ActionPlan[];

}

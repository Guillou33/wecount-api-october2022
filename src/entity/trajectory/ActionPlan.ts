import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Column,
  RelationId,
} from "typeorm";

import {
  ActivityCategory,
  ActivityModel,
  CampaignTrajectory,
  PossibleAction,
} from "@entity/index";
import { Exclude, Expose } from "class-transformer";

@Entity()
export class ActionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @ManyToOne(() => ActivityCategory)
  category: ActivityCategory;

  @RelationId((actionPlan: ActionPlan) => actionPlan.category)
  categoryId: number;

  @Exclude()
  @ManyToOne(() => CampaignTrajectory)
  campaignTrajectory: CampaignTrajectory;

  @RelationId((actionPlan: ActionPlan) => actionPlan.campaignTrajectory)
  campaignTrajectoryId: number;

  @Exclude()
  @ManyToOne(() => ActivityModel, undefined, { nullable: true })
  activityModel: ActivityModel | null;

  @RelationId((actionPlan: ActionPlan) => actionPlan.activityModel)
  activityModelId: number | null;

  @ManyToOne(() => PossibleAction, undefined, { nullable: true })
  action: PossibleAction | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  softDeletedAt: Date;

  @Column({ type: "float", nullable: true })
  reduction: number | null;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "text", nullable: true })
  comments: string | null;
}

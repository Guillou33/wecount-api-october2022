import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  DeleteDateColumn,
  RelationId,
} from "typeorm";
import { Perimeter } from "@root/entity";
import { Activity } from "@entity/activity/Activity";
import { CampaignTrajectory } from "@entity/index";
import { Exclude, Expose } from 'class-transformer';
import { CampaignStatus } from "../enum/CampaignStatus";
import { CampaignType } from "../enum/CampaignType";

@Exclude()
@Entity()
export class Campaign {
  @ManyToOne(() => Perimeter)
  perimeter: Perimeter;

  @Expose()
  @RelationId((campaign: Campaign) => campaign.perimeter)
  perimeterId: number;

  @Expose({ groups: ["campaign_with_activities"] })
  @OneToMany(() => Activity, (activity) => activity.campaign)
  activities: Activity[];

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
  @Column({ type: "enum", enum: CampaignStatus, default: CampaignStatus.IN_PREPARATION })
  status: CampaignStatus;
  
  @Expose()
  @Column({ type: "enum", enum: CampaignType, default: CampaignType.CARBON_FOOTPRINT })
  type: CampaignType;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ type: "text", nullable: true })
  description: string | null;

  @Expose()
  @Column("float", {default: 0})
  resultTco2Upstream: number;

  @Expose()
  @Column("float", {default: 0})
  uncertaintyUpstream: number;

  @Expose()
  @Column("float", {default: 0})
  resultTco2UpstreamForTrajectory: number;

  @Expose()
  @Column("float", {default: 0})
  uncertaintyUpstreamForTrajectory: number;

  @Expose()
  @Column("float", {default: 0})
  resultTco2Core: number;

  @Expose()
  @Column("float", {default: 0})
  uncertaintyCore: number;

  @Expose()
  @Column("float", {default: 0})
  resultTco2CoreForTrajectory: number;

  @Expose()
  @Column("float", {default: 0})
  uncertaintyCoreForTrajectory: number;

  @Expose()
  @Column("float", {default: 0})
  resultTco2Downstream: number;

  @Expose()
  @Column("float", {default: 0})
  uncertaintyDownstream: number;

  @Expose()
  @Column("float", {default: 0})
  resultTco2DownstreamForTrajectory: number;

  @Expose()
  @Column("float", {default: 0})
  uncertaintyDownstreamForTrajectory: number;

  @Expose()
  @Column({type: "year"})
  year: number;

  @Expose()
  @Column({type: "year", nullable: true})
  targetYear: number | null;

  @Exclude()
  @OneToMany(() => CampaignTrajectory, trajectory => trajectory.campaign)
  trajectories: CampaignTrajectory[];

  @Expose({ name: "campaignTrajectoryIds" })
  getCampaignTrajectoryIds(): number[] {
    return this.trajectories?.map(trajectory => trajectory.id) ?? []
  }
}

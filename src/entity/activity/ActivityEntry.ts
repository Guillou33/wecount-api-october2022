import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  RelationId,
  OneToMany,
} from "typeorm";
import { Activity } from "@entity/activity/Activity";
import { EmissionFactor } from "@entity/activity/EmissionFactor";
import { Exclude, Expose } from 'class-transformer';
import {
  ActivityEntryReference,
  ComputeMethod,
  Product,
  Site,
  User,
  EntryTagMapping,
} from "@entity/index";
import { Status } from '@entity/enum/Status';
import { ComputeMethodType } from '@entity/enum/ComputeMethodType';
import { CustomEmissionFactor } from "./CustomEmissionFactor";

export const DEFAULT_UNCERTAINTY = 0.1;

@Exclude()
@Entity()
export class ActivityEntry {
  @Expose({ groups: ["entry_with_activity", "with_campaign_year"] })
  @ManyToOne(() => Activity, (activity) => activity.activityEntries, {
    nullable: false,
  })
  @JoinColumn()
  activity: Activity;

  @RelationId((entry: ActivityEntry) => entry.activity)
  activityId: number

  @Expose()
  @ManyToOne(() => ActivityEntryReference, undefined, {nullable: false})
  @JoinColumn()
  activityEntryReference: ActivityEntryReference;

  @Expose()
  @ManyToOne(() => ComputeMethod, undefined, {nullable: true})
  computeMethod: ComputeMethod | null;

  @RelationId((activityEntry: ActivityEntry) => activityEntry.computeMethod)
  computeMethodId: number | null;

  @Expose()
  @ManyToOne(() => EmissionFactor, undefined, {nullable: true})
  emissionFactor: EmissionFactor | null;

  @RelationId((activityEntry: ActivityEntry) => activityEntry.emissionFactor)
  emissionFactorId: number | null;

  @Expose()
  @ManyToOne(() => CustomEmissionFactor, undefined, {nullable: true})
  customEmissionFactor: CustomEmissionFactor | null;

  @RelationId((activityEntry: ActivityEntry) => activityEntry.customEmissionFactor)
  customEmissionFactorId: number | null;
  
  @Expose()
  @Column("float", {nullable: true})
  customEmissionFactorValue: number | null;

  @Expose()
  @ManyToOne(() => Site, undefined, {nullable: true})
  site: Site | null;
  
  @RelationId((activityEntry: ActivityEntry) => activityEntry.site)
  siteId: number | null;
  
  @Expose()
  @ManyToOne(() => Product, undefined, {nullable: true})
  product: Product | null;
  
  @RelationId((activityEntry: ActivityEntry) => activityEntry.product)
  productId: number | null;
  
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;
  
  @Expose()
  @CreateDateColumn()
  createdAt: Date;
  
  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({type: "bool", default: false})
  lastUpdateByAdminImpersonation: boolean;
  
  @DeleteDateColumn()
  softDeletedAt: Date;
  
  @Expose()
  @Column({type: "text", nullable: true})
  title: string | null;

  @Column({type: "float", nullable: true})
  emissionFactorValue: number | null;
  
  @Expose()
  @Column({type: "float", nullable: true})
  manualTco2: number | null;
  
  @Expose()
  @Column({type: "float", nullable: true})
  manualUnitNumber: number | null;

  @Expose()
  @Column({type: "double", nullable: true})
  value: number | null;

  @Expose()
  @Column({type: "double", nullable: true})
  value2: number | null;

  @Expose()
  @Column("float")
  uncertainty: number;

  @Expose()
  @Column("float")
  resultTco2: number;

  @Expose()
  @Column({type: "text", nullable: true})
  description: string | null;

  @Expose()
  @Column({type: "text", nullable: true})
  instruction: string | null;

  @Expose()
  @Column({type: "bool", default: false})
  isExcludedFromTrajectory: boolean;

  @Expose()
  @Column({type: "text", nullable: true})
  dataSource: string | null;

  @Expose()
  @Column({ type: "enum", enum: Status, default: Status.IN_PROGRESS })
  status: Status;

  @Expose()
  @Column({ type: "enum", enum: ComputeMethodType, default: ComputeMethodType.STANDARD })
  computeMethodType: ComputeMethodType;

  @Expose()
  @ManyToOne(() => User, undefined, { nullable: true })
  owner: User | null;

  @Expose()
  @RelationId((entry: ActivityEntry) => entry.owner)
  ownerId: number | null;

  @Expose()
  @ManyToOne(() => User, undefined, { nullable: true })
  writer: User | null;

  @Expose()
  @RelationId((entry: ActivityEntry) => entry.writer)
  writerId: number | null;

  @Expose()
  @OneToMany(() => EntryTagMapping, entryTagMapping => entryTagMapping.activityEntry)
  entryTagMappings: EntryTagMapping[];
  
  @Column({type: "bool", default: false})
  ignoreResultConsistencyValidation: boolean;

  @Column({ type: "json", nullable: true })
  metadata: {
    fileName?: string,
    importTmestamp?: number,
  }

}

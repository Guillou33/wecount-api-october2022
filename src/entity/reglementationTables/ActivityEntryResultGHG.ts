import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  RelationId,
  DeleteDateColumn,
} from "typeorm";

import {
  ActivityEntry,
  Campaign,
  ReglementationSubCategory,
} from "@root/entity";

@Entity()
export class ActivityEntryResultGHG {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityEntry)
  activityEntry: ActivityEntry;

  @RelationId((t: ActivityEntryResultGHG) => t.activityEntry)
  activityEntryId: number;

  @ManyToOne(() => ReglementationSubCategory)
  subCategory: ReglementationSubCategory;

  @RelationId((t: ActivityEntryResultGHG) => t.subCategory)
  subCategoryId: number;

  @ManyToOne(() => Campaign)
  campaign: Campaign;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column("float")
  result: number;

  @Column("float")
  uncertainty: number;

  @Column("float")
  co2: number;

  @Column("float")
  ch4: number;

  @Column("float")
  n2O: number;

  @Column("float")
  hfcs: number;

  @Column("float")
  pfcs: number;

  @Column("float")
  sf6: number;

  @Column("float")
  otherGaz: number;

  @Column("float")
  co2b: number;
}

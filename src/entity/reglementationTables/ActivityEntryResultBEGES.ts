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
export class ActivityEntryResultBEGES {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityEntry)
  activityEntry: ActivityEntry;

  @RelationId((t: ActivityEntryResultBEGES) => t.activityEntry)
  activityEntryId: number;

  @ManyToOne(() => ReglementationSubCategory)
  subCategory: ReglementationSubCategory;

  @RelationId((t: ActivityEntryResultBEGES) => t.subCategory)
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
  otherGaz: number;

  @Column("float")
  co2b: number;
}

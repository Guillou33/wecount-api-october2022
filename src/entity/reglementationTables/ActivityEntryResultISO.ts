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
export class ActivityEntryResultISO {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityEntry)
  activityEntry: ActivityEntry;

  @RelationId((t: ActivityEntryResultISO) => t.activityEntry)
  activityEntryId: number;

  @ManyToOne(() => ReglementationSubCategory)
  subCategory: ReglementationSubCategory;

  @RelationId((t: ActivityEntryResultISO) => t.subCategory)
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
  fluoredGaz: number;

  @Column("float")
  otherGaz: number;

  @Column("float")
  co2bCombustion: number;

  @Column("float")
  co2bOther: number;
}

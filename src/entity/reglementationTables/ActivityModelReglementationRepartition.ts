import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  RelationId,
} from "typeorm";
import { Exclude } from "class-transformer";

import { ActivityModel, ReglementationSubCategory } from "@entity/index";

@Entity()
export class ActivityModelReglementationRepartition {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityModel)
  activityModel: ActivityModel;

  @RelationId("activityModel")
  activityModelId: number;

  @ManyToOne(() => ReglementationSubCategory)
  reglementationSubCategory: ReglementationSubCategory;

  @RelationId("reglementationSubCategory")
  reglementationSubCategoryId: number;

  @Column({ type: "float", default: 1 })
  ratio: number;
}
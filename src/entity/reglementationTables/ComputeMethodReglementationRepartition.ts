import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  RelationId,
} from "typeorm";
import { Exclude } from "class-transformer";

import { ComputeMethod, ReglementationSubCategory } from "@entity/index";

@Entity()
export class ComputeMethodReglementationRepartition {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ComputeMethod)
  computeMethod: ComputeMethod;

  @RelationId("computeMethod")
  computeMethodId: number;

  @ManyToOne(() => ReglementationSubCategory)
  reglementationSubCategory: ReglementationSubCategory;

  @RelationId("reglementationSubCategory")
  reglementationSubCategoryId: number;

  @Column({ type: "float", default: 1 })
  ratio: number;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  RelationId,
  Column,
} from "typeorm";

import { ReglementationTableCode } from "@root/entity/enum/ReglementationTableCode";

import { ReglementationSubCategory } from "@entity/index";

@Entity()
export class ReglementationSubCategoryMappingsForExceptions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReglementationSubCategory)
  defaultSubCategory: ReglementationSubCategory;

  @RelationId("defaultSubCategory")
  defaultSubCategoryId: number;

  @ManyToOne(() => ReglementationSubCategory)
  labelNotFound: ReglementationSubCategory;

  @RelationId("labelNotFound")
  labelNotFoundId: number;

  @ManyToOne(() => ReglementationSubCategory)
  powerPlantCombustion: ReglementationSubCategory;

  @RelationId("powerPlantCombustion")
  powerPlantCombustionId: number;

  @ManyToOne(() => ReglementationSubCategory)
  upstream: ReglementationSubCategory;

  @RelationId("upstream")
  upstreamId: number;

  @ManyToOne(() => ReglementationSubCategory)
  transportAndDistribution: ReglementationSubCategory;

  @RelationId("transportAndDistribution")
  transportAndDistributionId: number;

  @Column({ type: "enum", enum: ReglementationTableCode })
  tableCode: ReglementationTableCode;
}

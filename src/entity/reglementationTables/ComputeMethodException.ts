import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";

import {
  ComputeMethod,
  ReglementationSubCategoryMappingsForExceptions,
} from "@entity/index";

import { ReglementationException } from "@entity/enum/ReglementationException";

@Entity()
export class ComputeMethodException {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: ReglementationException })
  reglementationException: ReglementationException;

  @ManyToOne(() => ComputeMethod)
  computeMethod: ComputeMethod;

  @ManyToOne(() => ReglementationSubCategoryMappingsForExceptions)
  reglementationSubCategoryMappingsForExceptions: ReglementationSubCategoryMappingsForExceptions;
}

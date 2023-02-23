import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { EmissionFactorTagLabel, ComputeMethod } from "@entity/index";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity()
export class EmissionFactorTagLabelMapping {
  @Expose()
  @ManyToOne(() => EmissionFactorTagLabel, undefined, { nullable: false })
  emissionFactorTagLabel: EmissionFactorTagLabel;

  @ManyToOne(() => ComputeMethod, undefined, { nullable: false })
  computeMethod: ComputeMethod;

  @PrimaryGeneratedColumn()
  id: number;
}

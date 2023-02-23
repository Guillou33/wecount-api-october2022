import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { EmissionFactor, EmissionFactorTagLabel } from "@entity/index";
import { Exclude, Expose } from 'class-transformer';

@Exclude()
@Entity()
export class EmissionFactorMapping {
  @Expose()
  @ManyToOne(() => EmissionFactor, emissionFactor => emissionFactor.emissionFactorMappings, {nullable: false})
  emissionFactor: EmissionFactor;
  
  @ManyToOne(() => EmissionFactorTagLabel, undefined, {nullable: false})
  emissionFactorTagLabel: EmissionFactorTagLabel;

  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  recommended: boolean
}

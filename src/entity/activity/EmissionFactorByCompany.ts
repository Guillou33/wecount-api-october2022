import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Company, EmissionFactor } from "@entity/index";

@Entity()
export class EmissionFactorByCompany {
  @ManyToOne(() => Company, undefined, { nullable: false })
  company: Company;

  @ManyToOne(() => EmissionFactor, undefined, { nullable: false })
  emissionFactor: EmissionFactor;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}

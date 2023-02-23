import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { EmissionFactor } from "@entity/index";
import { CompanyGroup } from "../core/CompanyGroup";

@Entity()
export class EmissionFactorByCompanyGroup {
  @ManyToOne(() => CompanyGroup, undefined, { nullable: false })
  companyGroup: CompanyGroup;

  @ManyToOne(() => EmissionFactor, undefined, { nullable: false })
  emissionFactor: EmissionFactor;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Company, CompanyGroup } from "@entity/index";

@Entity()
export class CompanyGroupMapping {
  @ManyToOne(() => Company, undefined, { nullable: false })
  company: Company;

  @ManyToOne(() => CompanyGroup, undefined, { nullable: false })
  companyGroup: CompanyGroup;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}

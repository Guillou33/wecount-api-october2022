import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { CompanyGroup, ActivityModel } from "@entity/index";

@Entity()
export class ActivityModelByCompanyGroup {
  @ManyToOne(() => CompanyGroup, undefined, { nullable: false })
  companyGroup: CompanyGroup;

  @ManyToOne(() => ActivityModel, undefined, { nullable: false })
  activityModel: ActivityModel;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}

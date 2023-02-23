import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Company, ActivityModel } from "@entity/index";

@Entity()
export class ActivityModelByCompany {
  @ManyToOne(() => Company, undefined, { nullable: false })
  company: Company;

  @ManyToOne(() => ActivityModel, undefined, { nullable: false })
  activityModel: ActivityModel;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from "typeorm";

import { ActivityCategory, ActivityModel, Content } from "@entity/index";
import { Expose } from "class-transformer";

@Entity()
export class PossibleAction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityCategory)
  category: ActivityCategory;

  @ManyToOne(() => ActivityModel)
  activityModel: ActivityModel;

  // Translated, to inject with Repo
  nameTranslated: Content | null;
  @Column()
  nameContentCode: string;
  @Expose({ name: "name" })
  getNameTranslated(): string {
    return this.nameTranslated?.text ?? this.nameContentCode;
  }
}

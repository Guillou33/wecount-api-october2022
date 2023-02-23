import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { ActivityModel } from "@entity/activity/ActivityModel";
import { PossibleAction, Content } from "@entity/index";
import { Exclude, Expose } from 'class-transformer';

import { SCOPE } from '@entity/enum/Scope';

@Exclude()
@Entity()
export class ActivityCategory {
  @Expose()
  @OneToMany(
    () => ActivityModel,
    activityModel => activityModel.activityCategory
  )
  activityModels: ActivityModel[];

  @Expose()
  @OneToMany(() => PossibleAction, possibleAction => possibleAction.category)
  possibleActions: PossibleAction[];

  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  creationDate: Date;

  @Expose()
  @Column({ type: "enum", enum: SCOPE })
  scope: SCOPE;

  // Translated, to inject with Repo
  nameTranslated: Content | null;
  @Column()
  nameContentCode: string;
  @Expose({ name: "name" })
  getNameTranslated(): string {
    return this.nameTranslated?.text ?? this.nameContentCode;
  }

  @Expose()
  @Column({ type: "varchar", nullable: true })
  iconName: string | null;

  // Translated, to inject with Repo
  descriptionTranslated: Content | null;
  @Column({ type: "varchar", nullable: true })
  descriptionContentCode: string | null;
  @Expose({ name: "description" })
  getDescriptionTranslated(): string | null {
    return this.descriptionTranslated?.text ?? this.descriptionContentCode;
  }

  // Translated, to inject with Repo
  actionPlanHelpTranslated: Content | null;
  @Column({ type: "varchar", nullable: true })
  actionPlanHelpContentCode: string | null;
  @Expose({ name: "actionPlanHelp" })
  getActionPlanHelpTranslated(): string | null {
    return this.actionPlanHelpTranslated?.text ?? this.actionPlanHelpContentCode;
  }

  @Expose()
  @Column({ type: "integer", default: 0 })
  order: number;

  @Expose()
  @Column({ type: "integer", default: 0 })
  numberCode: number;

  @Column({ type: "integer", nullable: true })
  ingestionTempId: number;
}

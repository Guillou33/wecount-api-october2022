import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { ActivityCategory, Activity, ComputeMethod, PossibleAction } from "@entity/index";
import { Exclude, Expose } from "class-transformer";
import { ComputeMode } from "@entity/enum/ComputeMode";
import { Content } from "../translation/Content";

@Exclude()
@Entity()
export class ActivityModel {
  @Expose({ groups: ["activity_model_with_category"] })
  @ManyToOne(
    () => ActivityCategory,
    (activityCategory) => activityCategory.activityModels,
    { nullable: false }
  )
  @JoinColumn()
  activityCategory: ActivityCategory;

  @Expose({ groups: ["activity_model_with_activities"] })
  @OneToMany(() => Activity, (activity) => activity.activityModel)
  @JoinColumn()
  activities: Activity;

  @Expose()
  @OneToMany(() => PossibleAction, possibleAction => possibleAction.activityModel)
  possibleActions: PossibleAction[];

  @OneToMany(() => ComputeMethod, (computeMethod) => computeMethod.activityModel)
  @JoinColumn()
  computeMethods: ComputeMethod[];

  @Expose({ groups: ["activity_model_short", "activity_model_base"] })
  @PrimaryGeneratedColumn()
  id: number;

  @Expose({ groups: ["activity_model_base"] })
  @CreateDateColumn()
  createdAt: Date;

  // Translated, to inject with Repo
  nameTranslated: Content | null;
  @Column()
  nameContentCode: string;
  @Expose({ name: "name", groups: ["activity_model_base"] })
  getNameTranslated(): string {
    return this.nameTranslated?.text ?? this.nameContentCode;
  }

  // Translated, to inject with Repo
  descriptionTranslated: Content | null;
  @Column({ type: "varchar", nullable: true })
  descriptionContentCode: string | null;
  @Expose({ name: "description", groups: ["activity_model_base"] })
  getDescriptionTranslated(): string | null {
    return this.descriptionTranslated?.text ?? this.descriptionContentCode;
  }

  // Translated, to inject with Repo
  helpTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  helpContentCode: string | null;
  @Expose({ name: "help", groups: ["activity_model_base"] })
  getHelpTranslated(): string | null {
    return this.helpTranslated?.text ?? this.helpContentCode;
  }

  // Translated, to inject with Repo
  helpIframeTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  helpIframeContentCode: string | null;
  @Expose({ name: "helpIframe", groups: ["activity_model_base"] })
  getHelpIframeTranslated(): string | null {
    return this.helpIframeTranslated?.text ?? this.helpIframeContentCode;
  }

  // Translated, to inject with Repo
  seeMoreTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  seeMoreContentCode: string | null;
  @Expose({ name: "seeMore", groups: ["activity_model_base"] })
  getSeeMoreTranslated(): string | null {
    return this.seeMoreTranslated?.text ?? this.seeMoreContentCode;
  }

  // Translated , to inject with Repo
  seeMoreIframeTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  seeMoreIframeContentCode: string | null;
  @Expose({ name: "seeMoreIframe", groups: ["activity_model_base"] })
  getSeeMoreIframeTranslated(): string | null {
    return this.seeMoreIframeTranslated?.text ?? this.seeMoreIframeContentCode;
  }

  @Expose()
  @Column({type: "bool", default: false})
  onlyManual: boolean;

  @Expose()
  @Column({ type: "varchar", unique:true, nullable:true })
  uniqueName: string | null;

  @Column({ type: "bool", default: true})
  visibleByDefault: boolean;

  @Expose()
  @Column({ type: "bool", default: false})
  isPrivate: boolean;

  @Expose()
  @Column({type: "datetime", nullable: true})
  archivedDate: Date | null;

  @Column({type: "integer", nullable: true})
  ingestionTempId: number | null;

  @Expose()
  @Column({type: "integer", nullable: true})
  position: number;

  @Expose()
  @Column({ type: "integer", default: 0 })
  numberCode: number;
}

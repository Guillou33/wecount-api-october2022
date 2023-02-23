import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Perimeter, ActivityCategorySetting } from "@entity/index";
import { ActivityModel } from "@entity/activity/ActivityModel";

@Entity()
export class ActivityModelPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Perimeter)
  @JoinColumn()
  perimeter: Perimeter;

  @ManyToMany(() => ActivityModel)
  @JoinTable({ name: "visible_activity_model" })
  visibleActivityModels: ActivityModel[];

  @OneToMany(
    () => ActivityCategorySetting,
    activityCategorySetting => activityCategorySetting.activityModelPreference
  )
  categorySettings: ActivityCategorySetting[];
}

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  RelationId,
} from "typeorm";
import { ActivityModelPreference, ActivityCategory } from "@entity/index";
import { Exclude } from "class-transformer";

@Entity()
export class ActivityCategorySetting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityModelPreference)
  activityModelPreference: ActivityModelPreference;

  @Exclude()
  @ManyToOne(() => ActivityCategory)
  activityCategory: ActivityCategory;

  @RelationId(
    (activityCategorySetting: ActivityCategorySetting) =>
      activityCategorySetting.activityCategory
  )
  activityCategoryId: number;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "integer", nullable: true })
  order: number | null;
}

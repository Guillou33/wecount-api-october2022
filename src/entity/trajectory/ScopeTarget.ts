import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from "typeorm";

import { TrajectorySettings } from "@entity/index";
import { SCOPE } from "@entity/enum/Scope";
import { Exclude } from "class-transformer";

@Entity()
export class ScopeTarget {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @ManyToOne(() => TrajectorySettings)
  trajectorySettings: TrajectorySettings;

  @Column({ type: "enum", enum: SCOPE })
  scope: SCOPE;

  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  @Column({ type: "float", nullable: true, default: null })
  target: number | null;
}

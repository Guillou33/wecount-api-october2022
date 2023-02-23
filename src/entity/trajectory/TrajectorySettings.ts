import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  Column,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Exclude } from "class-transformer";

import { Perimeter, ScopeTarget } from "@entity/index";

@Entity()
export class TrajectorySettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @OneToOne(() => Perimeter)
  @JoinColumn()
  perimeter: Perimeter;

  @Column({ type: "year", nullable: true })
  targetYear: number | null;

  @OneToMany(() => ScopeTarget, scopeTarget => scopeTarget.trajectorySettings)
  scopeTargets: ScopeTarget[];
}

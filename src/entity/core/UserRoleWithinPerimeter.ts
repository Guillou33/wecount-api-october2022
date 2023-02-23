import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Index,
  RelationId,
} from "typeorm";
import { Exclude } from "class-transformer";

import { Perimeter, User } from "@root/entity";
import { ASSIGNABLE_PERIMETER_ROLE } from "@entity/enum/PerimeterRole";

@Entity()
@Index(["perimeter", "user"], { unique: true })
export class UserRoleWithinPerimeter {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @ManyToOne(() => Perimeter)
  perimeter: Perimeter;

  @RelationId((userRole: UserRoleWithinPerimeter) => userRole.perimeter)
  perimeterId: number;

  @Exclude()
  @ManyToOne(() => User)
  user: User;

  @RelationId((userRole: UserRoleWithinPerimeter) => userRole.user)
  userId: number;

  @Column({ type: "enum", enum: ASSIGNABLE_PERIMETER_ROLE })
  role: ASSIGNABLE_PERIMETER_ROLE;
}

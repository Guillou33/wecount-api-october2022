import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { ROLES } from "@service/core/security/auth/config";
import { Profile } from "@entity/core/Profile";
import { Company } from "@entity/core/Company";
import { UserRoleWithinPerimeter } from "@entity/core/UserRoleWithinPerimeter";
import { Exclude, Expose } from 'class-transformer';
import { LOCALE } from "../enum/Locale";

@Exclude()
@Entity()
export class User {
  constructor() {
    this.roles = [];
  }

  @Expose({groups: ['user_with_profile']})
  @OneToOne(() => Profile, (profile) => profile.user, { nullable: false })
  @JoinColumn()
  profile: Profile;
  
  @Expose({groups: ['user_with_company']})
  @ManyToOne(() => Company, company => company.users, { nullable: false })
  @JoinColumn()
  company: Company;

  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @Column({ unique: true })
  email: string;

  @Column({type: "varchar", nullable: true})
  password: string | null;
  
  @Column({ type: "enum", enum: LOCALE, nullable: true })
  locale: LOCALE | null;

  @Expose({ name: 'passwordIsSet' })
  isPasswordSet() {
    return !!this.password;
  }

  @Expose({ name: 'isAdmin' })
  isAdmin() {
    return this.roles.indexOf(ROLES.ROLE_ADMIN) !== -1;
  }

  @Expose({ name: 'isManager' })
  isManager() {
    return this.roles.indexOf(ROLES.ROLE_MANAGER) !== -1;
  }
  
  @Expose()
  @Column({type: "bool", default: false})
  archived: boolean;

  @Expose()
  @Column({ type: "json" })
  private roles: ROLES[];

  @Column({type: "varchar", nullable: true})
  resetPasswordToken: string | null;

  @Expose()
  @Column({type: "boolean", default: false})
  acceptCgvu: boolean;

  @Column({type: "int", default: 0})
  consecutivePasswordErrors: number;

  @Column({type: "datetime", nullable: true})
  lastPasswordErrorAt: Date | null;

  getRoles(): ROLES[] {
    return [...this.roles, ROLES.ROLE_USER];
  }

  addRole(role: ROLES): User {
    this.roles = [...this.roles, role];
    return this;
  }

  @Expose({ groups: ["user_with_perimeter_roles"] })
  @OneToMany(
    () => UserRoleWithinPerimeter,
    userRoleWithinPerimeter => userRoleWithinPerimeter.user
  )
  roleWithinPerimeters: UserRoleWithinPerimeter[];
}

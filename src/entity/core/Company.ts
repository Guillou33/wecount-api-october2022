import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from "typeorm";
import { User } from "@entity/index";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity()
export class Company {
  @Expose({groups: ['company_with_users']})
  @OneToMany(() => User, user => user.company)
  users: User[];

  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @CreateDateColumn() 
  createdAt: Date;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({nullable: true})
  logoUrl: string;

  @Expose()
  @Column({type: "datetime", nullable: true})
  lockedDate: Date | null;

  @Expose()
  @Column({type:"boolean", default: false})
  readonlyMode: boolean
}

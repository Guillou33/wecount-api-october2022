import { Entity, Column, PrimaryGeneratedColumn, OneToOne, CreateDateColumn } from "typeorm";
import { User } from '@entity/auth/User';
import { userInfo } from "os";

@Entity()
export class Profile {
  @OneToOne(() => User, user => user.profile)
  user: User

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn() 
  createdAt: Date;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
}

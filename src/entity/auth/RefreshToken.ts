import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from '@entity/auth/User';

@Entity()
export class RefreshToken {
  @ManyToOne(type => User, undefined, {nullable: false})
  @JoinColumn()
  user: User;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({unique: true})
  token: string;

  @Column({type: "datetime", nullable: false})
  expirationDate: Date;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity()
export class CompanyGroup {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @Column()
  name: string;
}

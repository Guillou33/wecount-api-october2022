import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Column,
} from "typeorm";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity()
@Unique("UniqueRawReferenceId", ["rawReferenceId"])
export class ActivityEntryReference {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  @Column("varchar")
  rawReferenceId: string;

  @Expose()
  @Column("varchar")
  referenceId: string;
}

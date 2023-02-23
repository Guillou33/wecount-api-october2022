import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Perimeter } from "@entity/index";

@Entity()
export class EntryTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Perimeter)
  perimeter: Perimeter;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  name: string;

  @Column({ type: "datetime", nullable: true })
  archivedDate: Date | null;
}

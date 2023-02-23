import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Exclude, Expose } from 'class-transformer';
import { Company } from "..";
import { Perimeter } from "../core/Perimeter";

@Exclude()
@Entity()
export class CustomEmissionFactor {
  @Exclude()
  @ManyToOne(() => Perimeter)
  perimeter: Perimeter;

  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  @Column("float")
  value: number;

  @Expose()
  @Column({ type: "varchar" })
  name: string;
  
  @Expose()
  @Column({ type: "varchar" })
  input1Name: string;
  
  @Expose()
  @Column({ type: "varchar" })
  input1Unit: string;

  @Expose()
  @Column({type: "text", nullable: true})
  comment: string | null;

  @Expose()
  @Column({type: "text", nullable: true})
  source: string | null;

  @Expose()
  @Column({type: "datetime", nullable: true})
  archivedDate: Date | null;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Perimeter } from "@entity/index";

@Entity()
export class Product {
  @ManyToOne(() => Perimeter)
  perimeter: Perimeter;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn() 
  createdAt: Date;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "integer", nullable: true })
  quantity: number | null;

  @Column({type: "datetime", nullable: true})
  archivedDate: Date | null;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Tree, TreeChildren, TreeParent } from "typeorm";
import { Perimeter } from "@entity/index";
import { Exclude, Expose } from 'class-transformer';

@Exclude()
@Entity()
@Tree("closure-table")
export class Site {
  @ManyToOne(() => Perimeter)
  perimeter: Perimeter;

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
  @Column({ type: "text", nullable: true })
  description: string | null;

  @Expose()
  @Column({type: "datetime", nullable: true})
  archivedDate: Date | null;

  @Expose()
  @TreeParent()
  siteParent: Site;

  @Expose()
  @TreeChildren()
  subSites: Site[];
}

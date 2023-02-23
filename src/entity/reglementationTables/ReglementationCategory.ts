import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Exclude, Expose } from "class-transformer";


import { ReglementationTable, ReglementationSubCategory } from "@entity/index";
import { Content } from "../translation/Content";

@Exclude()
@Entity()
export class ReglementationCategory {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @ManyToOne(() => ReglementationTable)
  reglementationTable: ReglementationTable;

  // Translated name, to inject with Repo
  nameTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  nameContentCode: string;
  @Expose({ name: "name" })
  getNameTranslated(): string {
    return this.nameTranslated?.text ?? this.nameContentCode;
  }

  @Column({ type: "integer" })
  position: number;

  @Expose()
  @OneToMany(
    () => ReglementationSubCategory,
    reglementationSubCategory =>
      reglementationSubCategory.reglementationCategory
  )
  reglementationSubCategories: ReglementationSubCategory[];
}

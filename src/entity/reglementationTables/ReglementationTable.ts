import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

import { ReglementationCategory } from "@entity/index";
import { Content } from "../translation/Content";
import { Expose, Exclude } from "class-transformer";

@Exclude()
@Entity()
export class ReglementationTable {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  // Translated name, to inject with Repo
  nameTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  nameContentCode: string;
  @Expose({ name: "name" })
  getNameTranslated(): string {
    return this.nameTranslated?.text ?? this.nameContentCode;
  }

  @Expose()
  @OneToMany(
    () => ReglementationCategory,
    reglementationCategory => reglementationCategory.reglementationTable
  )
  reglementationCategories: ReglementationCategory[];
}

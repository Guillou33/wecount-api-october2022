import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Exclude, Expose } from "class-transformer";

import { ReglementationCategory } from "@entity/index";
import { Content } from "../translation/Content";

@Exclude()
@Entity()
export class ReglementationSubCategory {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @ManyToOne(() => ReglementationCategory)
  reglementationCategory: ReglementationCategory;

  @Column({ type: "varchar", unique: true })
  code: string;

  // Translated name, to inject with Repo
  nameTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  nameContentCode: string;
  @Expose({ name: "name" })
  getNameTranslated(): string {
    return this.nameTranslated?.text ?? this.nameContentCode;
  }

  @Column({ type: "integer"})
  position: number;
}

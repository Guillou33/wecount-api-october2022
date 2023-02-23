import { Exclude, Expose } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from "typeorm";
import { EmissionFactorTagLabel, Content } from "@entity/index";

@Exclude()
@Entity()
export class EmissionFactorTag {
  @ManyToOne(() => EmissionFactorTagLabel, undefined, { nullable: false })
  emissionFactorTagLabel: EmissionFactorTagLabel;

  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tempIngestionId: string;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;
  
  // Translated, to inject with Repo
  nameTranslated: Content | null;
  @Column()
  nameContentCode: string;
  @Expose({ name: "name" })
  getNameTranslated(): string {
    return this.nameTranslated?.text ?? this.nameContentCode;
  }
}

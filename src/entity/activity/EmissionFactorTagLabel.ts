import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  OneToMany,
} from "typeorm";
import { Expose, Exclude } from "class-transformer";
import { EmissionFactorTag, EmissionFactorMapping } from "@entity/index";
import { Content } from "../translation/Content";
import { EmissionFactorTagLabelRelation } from "./EmissionFactorTagLabelRelation";

@Exclude()
@Entity()
export class EmissionFactorTagLabel {
  @Expose()
  @OneToMany(() => EmissionFactorTagLabelRelation, eftlr => eftlr.parentTag)
  childrenLabelMappings: EmissionFactorTagLabelRelation[];

  @Expose({ groups: ["compute_method_with_emission_factor", "with_ef_tags"] })
  @OneToMany(() => EmissionFactorMapping, efm => efm.emissionFactorTagLabel)
  emissionFactorMappings: EmissionFactorMapping[];

  @Expose()
  @OneToMany(() => EmissionFactorTag, eft => eft.emissionFactorTagLabel)
  emissionFactorTags: EmissionFactorTag[];

  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tempIngestionId: string;

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

  @Column()
  isRoot: boolean;

  @Column()
  isFinal: boolean;
}

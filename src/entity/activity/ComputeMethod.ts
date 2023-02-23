import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  OneToMany,
} from "typeorm";
import { ActivityModel, EmissionFactorMapping, Content, EmissionFactorTagLabelMapping } from "@entity/index";
import { Expose } from "class-transformer";
import { ComputeMode } from "../enum/ComputeMode";
import { SearchType } from "../enum/SearchType";

@Entity()
export class ComputeMethod {
  @ManyToOne(() => ActivityModel, (activityModel) => activityModel.computeMethods, {nullable: false})
  activityModel: ActivityModel;

  @Expose({ groups: ["with_ef_tag_labels", "compute_method_with_emission_factor", "with_ef_tags"] })
  @OneToMany(() => EmissionFactorTagLabelMapping, eftlm => eftlm.computeMethod)
  emissionFactorTagLabelMappings: EmissionFactorTagLabelMapping[];
  
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  // Translated name, to inject with Repo
  nameTranslated: Content | null;
  @Column()
  nameContentCode: string;
  @Expose({ name: "name" })
  getNameTranslated(): string {
    return this.nameTranslated?.text ?? this.nameContentCode;
  }

  // Translated description, to inject with Repo
  descriptionTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  descriptionContentCode: string | null;
  @Expose({ name: "description" })
  getDescriptionTranslated(): string | null {
    return this.descriptionTranslated?.text ?? this.descriptionContentCode;
  }

  @Expose()
  @Column({type: "integer"})
  position: number;

  @Expose()
  @Column()
  isDefault: boolean;

  @Column()
  hasAllEf: boolean;

  // Translated emissionFactorLabel, to inject with Repo
  emissionFactorLabelTranslated: Content | null;
  @Column({ type: "varchar", nullable: true })
  emissionFactorLabelContentCode: string | null;
  @Expose({ name: "emissionFactorLabel" })
  getEmissionFactorLabelTranslated(): string | null {
    return this.emissionFactorLabelTranslated?.text ?? this.emissionFactorLabelContentCode;
  }

  // Translated valueName, to inject with Repo
  valueNameTranslated: Content | null;
  @Column()
  valueNameContentCode: string;
  @Expose({ name: "valueName" })
  getValueNameTranslated(): string {
    return this.valueNameTranslated?.text ?? this.valueNameContentCode;
  }

  // Translated value2Name, to inject with Repo
  value2NameTranslated: Content | null;
  @Column({ type: "varchar", nullable: true })
  value2NameContentCode: string | null;
  @Expose({ name: "value2Name" })
  getValue2NameTranslated(): string | null {
    return this.value2NameTranslated?.text ?? this.value2NameContentCode;
  }

  @Expose()
  @Column({ type: "enum", enum: ComputeMode, nullable: true })
  specialComputeMode: ComputeMode | null;

  @Expose()
  @Column({ type: "enum", enum: SearchType, default: SearchType.comboBox })
  emissionFactorSearchType: SearchType;

  @Expose()
  @Column({ type: "bool", default: false})
  relatedEFAreEditableEvenIfHasHistory: boolean;

  @Expose()
  @Column({type: "datetime", nullable: true})
  archivedDate: Date | null;

  @Column({type: "integer", nullable: true})
  ingestionTempId: number | null;
}

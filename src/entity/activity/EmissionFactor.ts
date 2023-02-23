import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { EmissionFactorMapping, EmissionFactorInfo } from "@entity/index";
import { Exclude, Expose } from 'class-transformer';
import { ArchivedReason, DbName, ElementType, InactiveReason, NotVisibleReason } from "../enum/EmissionFactorEnums";
import { Content } from "../translation/Content";

@Exclude()
@Entity()
export class EmissionFactor {
  @OneToMany(() => EmissionFactorMapping, emissionFactorMapping => emissionFactorMapping.emissionFactor, {nullable: false})
  emissionFactorMappings: EmissionFactorMapping[];

  @Expose({ groups: ["with_ef_info"] })
  @OneToOne(() => EmissionFactorInfo, undefined, {nullable: true})
  @JoinColumn()
  emissionFactorInfo: EmissionFactorInfo;

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

  @Expose({groups: ['from_ingestor']})
  @Column({ type: "enum", enum: ElementType })
  elementType: ElementType;

  @Expose({groups: ['from_ingestor', 'with_dbname']})
  @Index()
  @Column({ type: "enum", enum: DbName })
  dbName: DbName;

  @Expose({groups: ['from_ingestor']})
  @Index()
  @Column({ type: "varchar" })
  dbId: string;

  @Expose()
  @Column("float")
  uncertainty: number;

  // Translated name, to inject with Repo
  nameTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  nameContentCode: string;
  @Expose({ name: "name" })
  getNameTranslated(): string {
    return this.nameTranslated?.text ?? this.nameContentCode;
  }
  
  // Translated source, to inject with Repo
  sourceTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  sourceContentCode: string | null;
  @Expose({ name: "source" })
  getSourceTranslated(): string | null {
    return this.sourceTranslated?.text ?? this.sourceContentCode;
  }
  
  // Translated description, to inject with Repo
  descriptionTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  descriptionContentCode: string | null;
  @Expose({ name: "description" })
  getDescriptionTranslated(): string | null {
    return this.descriptionTranslated?.text ?? this.descriptionContentCode;
  }
  
  // Translated unit, to inject with Repo
  unitTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  unitContentCode: string | null;
  @Expose({ name: "unit" })
  getUnitTranslated(): string | null {
    return this.unitTranslated?.text ?? this.unitContentCode;
  }

  // Translated input1Unit, to inject with Repo
  input1UnitTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  input1UnitContentCode: string | null;
  @Expose({ name: "input1Unit" })
  getInput1UnitTranslated(): string | null {
    return this.input1UnitTranslated?.text ?? this.input1UnitContentCode;
  }
  
  // Translated input2Unit, to inject with Repo
  input2UnitTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  input2UnitContentCode: string | null;
  @Expose({ name: "input2Unit" })
  getInput2UnitTranslated(): string | null {
    return this.input2UnitTranslated?.text ?? this.input2UnitContentCode;
  }

  // Translated program, to inject with Repo
  programTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  programContentCode: string | null;
  @Expose({ name: "program" })
  getProgramTranslated(): string | null {
    return this.programTranslated?.text ?? this.programContentCode;
  }
  
  // Translated urlProgram, to inject with Repo
  urlProgramTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  urlProgramContentCode: string | null;
  @Expose({ name: "urlProgram" })
  getUrlProgramTranslated(): string | null {
    return this.urlProgramTranslated?.text ?? this.urlProgramContentCode;
  }

  // Translated comment, to inject with Repo
  commentTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  commentContentCode: string | null;
  @Expose({ name: "comment" })
  getCommentTranslated(): string | null {
    return this.commentTranslated?.text ?? this.commentContentCode;
  }

  @Expose()
  @Column({ type: "bool", default: false})
  isPrivate: boolean;

  // Archived just add a picto (archived) next to the EF
  @Expose()
  @Column({ type: "bool", default: false})
  archived: boolean;

  @Expose({groups: ['from_ingestor']})
  @Column({ type: "enum", enum: ArchivedReason, nullable: true })
  archivedReason: ArchivedReason | null;

  @Expose({groups: ['from_ingestor']})
  @Column({type: "varchar", nullable: true})
  archivedComment: string | null;

  // NotVisible means only usable / visible by people who have data linked to it. 
  @Expose()
  @Column({ type: "bool", default: false})
  notVisible: boolean;

  @Expose({groups: ['from_ingestor']})
  @Column({ type: "enum", enum: ArchivedReason, nullable: true })
  notVisibleReason: NotVisibleReason | null;

  @Expose({groups: ['from_ingestor']})
  @Column({type: "varchar", nullable: true})
  notVisibleComment: string | null;

  // Inactive means never used
  @Expose()
  @Column({ type: "bool", default: false})
  inactive: boolean;

  @Expose({groups: ['from_ingestor']})
  @Column({ type: "enum", enum: InactiveReason, nullable: true })
  inactiveReason: InactiveReason | null;

  @Expose({groups: ['from_ingestor']})
  @Column({type: "varchar", nullable: true})
  inactiveComment: string | null;

  @Expose({groups: ['from_ingestor']})
  @Column({type: "varchar", nullable: true})
  wecountComment: string | null;

  @Expose({groups: ['from_ingestor']})
  @Column({type: "varchar", nullable: true})
  oldWecountIds: string | null;
  
  @Expose({groups: ['from_ingestor']})
  @Column({type: "varchar", nullable: true})
  oldFesId: string | null;

  // used by reglementation table repartition, exception 2
  @Column({ type: "bool", default: false })
  isRepartitionedByPosteDecomposition: boolean;

  @Expose({groups: ['with_ef_tags']})
  @Column({ type: "json" })
  tagIds: number[];
}

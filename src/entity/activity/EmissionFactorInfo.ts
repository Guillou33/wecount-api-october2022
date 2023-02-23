import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Expose, Exclude } from "class-transformer";

@Exclude()
@Entity()
export class EmissionFactorInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "datetime", nullable: true })
  officialCreationDate: Date | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "datetime", nullable: true })
  officialModificationDate: Date | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  elementInformation: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "datetime", nullable: true })
  validityPeriod: Date | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  lineType: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  structure: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  frenchBaseName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  englishBaseName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  spanishBaseName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  frenchAttributeName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  englishAttributeName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  spanishAttributeName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  frenchBorderName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  englishBorderName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  spanishBorderName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  categoryCore: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  frenchTags: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  englishTags: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  spanishTags: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  frenchUnit: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  englishUnit: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  spanishUnit: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  contributor: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  otherContributors: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  geographicLocalization: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  geographicSubLocalizationFrench: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  geographicSubLocalizationEnglish: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  geographicSubLocalizationSpanish: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  regulations: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "integer", nullable: true })
  transparency: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "integer", nullable: true })
  quality: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "integer", nullable: true })
  qualityTer: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "integer", nullable: true })
  qualityGr: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "integer", nullable: true })
  qualityTir: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "integer", nullable: true })
  qualityC: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "integer", nullable: true })
  qualityP: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "integer", nullable: true })
  qualityM: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "text", nullable: true })
  frenchComment: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "text", nullable: true })
  englishComment: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "text", nullable: true })
  spanishComment: string | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "text", nullable: true })
  postType: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "text", nullable: true })
  frenchPostName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "text", nullable: true })
  englishPostName: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "text", nullable: true })
  spanishPostName: string | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  cO2f: number | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  cH4f: number | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  cH4b: number | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  n2O: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  codeGazSupplementaire: string | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  valeurGazSupplementaire: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  codeGazSupplementaire2: string | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  valeurGazSupplementaire2: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  codeGazSupplementaire3: string | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  valeurGazSupplementaire3: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  codeGazSupplementaire4: string | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  valeurGazSupplementaire4: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  codeGazSupplementaire5: string | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  valeurGazSupplementaire5: number | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  autreGES: number | null;

  @Expose({ groups: ["with_gas_detail", "from_ingestor"] })
  @Column({ type: "float", nullable: true })
  cO2b: number | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  wecountNameFrench: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  wecountNameEnglish: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  tag1: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  tag2: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  tag3: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "varchar", nullable: true })
  tag4: string | null;

  @Expose({ groups: ["from_ingestor"] })
  @Column({ type: "bool", default: false })
  uncertaintyWasUnknownAtIngestionTime: boolean;
}

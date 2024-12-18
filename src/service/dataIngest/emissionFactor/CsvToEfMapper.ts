import { EmissionFactor } from "@root/entity";
import { ArchivedReason, DbName, ElementType, InactiveReason } from "@root/entity/enum/EmissionFactorEnums";
import { DeepPartial } from "typeorm";
import { CsvLine } from "./Ingestor";

export default class CsvToEfMapper {
  map(line: any[], emissionFactorDb: DbName) {
    
    const isPoste = line[CsvLine.LINE_TYPE].toLowerCase() === 'poste';
    const isInactive = isPoste || (line[CsvLine.ELEMENT_STATUS].toLowerCase().indexOf('archiv') === -1 && line[CsvLine.ELEMENT_STATUS].toLowerCase().indexOf('valide') === -1);

    return {
      value: line[CsvLine.POST_TOTAL_NOT_DECOMPOSED],
      elementType: isPoste ? ElementType.POSTE : ElementType.ELEMENT,
      dbName: emissionFactorDb,
      dbId: line[CsvLine.ELEMENT_ID],
      oldWecountIds: line[CsvLine.OLD_WECOUNT_IDS],
      oldFesId: line[CsvLine.OLD_FES_ID],
      uncertainty: line[CsvLine.UNCERTAINTY] ?? 0,
      name: line[CsvLine.WECOUNT_NAME_FRENCH],
      nameEn: line[CsvLine.WECOUNT_NAME_ENGLISH],
      source: line[CsvLine.CONCATENATED_SOURCE] ?? line[CsvLine.SOURCE],
      sourceEn: line[CsvLine.CONCATENATED_SOURCE] ?? line[CsvLine.SOURCE],
      description: line[CsvLine.WECOUNT_COMMENT],
      descriptionEn: line[CsvLine.WECOUNT_COMMENT],
      unit: line[CsvLine.FRENCH_UNIT],
      unitEn: line[CsvLine.ENGLISH_UNIT],
      input1Unit: line[CsvLine.UNIT_INPUT_1],
      input1UnitEn: line[CsvLine.UNIT_INPUT_1],
      input2Unit: line[CsvLine.UNIT_INPUT_2],
      input2UnitEn: line[CsvLine.UNIT_INPUT_2],
      program: line[CsvLine.PROGRAM],
      programEn: line[CsvLine.PROGRAM],
      urlProgram: line[CsvLine.PROGRAM_URL],
      urlProgramEn: line[CsvLine.PROGRAM_URL],
      isPrivate: line[CsvLine.WECOUNT_STATUS]?.toLowerCase() === "privé",
      archived: line[CsvLine.ELEMENT_STATUS].toLowerCase().indexOf('archiv') !== -1,
      archivedReason: line[CsvLine.ELEMENT_STATUS].toLowerCase().indexOf('archiv') !== -1 ? ArchivedReason.OTHER : null,
      archivedComment: null,
      inactive: isInactive,
      inactiveReason: isInactive ? (isPoste ? InactiveReason.POSTE : InactiveReason.OTHER) : null,
      inactiveComment: isInactive ? line[CsvLine.ELEMENT_STATUS] : null,
      wecountComment: line[CsvLine.ELEMENT_STATUS],
      notVisible: line[CsvLine.ELEMENT_STATUS].toLowerCase().indexOf('non visible') !== -1,
      emissionFactorInfo: {
        elementInformation: line[CsvLine.ELEMENT_TYPE],
        officialCreationDate: line[CsvLine.CREATION_DATE],
        officialModificationDate: line[CsvLine.MODIFICATION_DATE],
        validityPeriod: line[CsvLine.VALIDITY_PERIOD],
        lineType: line[CsvLine.LINE_TYPE],
        structure: line[CsvLine.STRUCTURE],
        frenchBaseName: line[CsvLine.FRENCH_BASE_NAME],
        englishBaseName: line[CsvLine.ENGLISH_BASE_NAME],
        spanishBaseName: line[CsvLine.SPANISH_BASE_NAME],
        frenchAttributeName: line[CsvLine.FRENCH_ATTRIBUTE_NAME],
        englishAttributeName: line[CsvLine.ENGLISH_ATTRIBUTE_NAME],
        spanishAttributeName: line[CsvLine.SPANISH_ATTRIBUTE_NAME],
        frenchBorderName: line[CsvLine.FRENCH_BORDER_NAME],
        englishBorderName: line[CsvLine.ENGLISH_BORDER_NAME],
        spanishBorderName: line[CsvLine.FRENCH_BORDER_NAME],
        categoryCore: line[CsvLine.CATEGORY_CODE],
        frenchTags: line[CsvLine.FRENCH_TAGS],
        englishTags: line[CsvLine.ENGLISH_TAGS],
        spanishTags: line[CsvLine.SPANISH_TAGS],
        frenchUnit: line[CsvLine.FRENCH_UNIT],
        englishUnit: line[CsvLine.ENGLISH_UNIT],
        spanishUnit: line[CsvLine.SPANISH_UNIT],
        contributor: line[CsvLine.CONTRIBUTOR],
        otherContributors: line[CsvLine.OTHER_CONTRIBUTORS],
        geographicLocalization: line[CsvLine.GEOGRAPHIC_LOCALIZATION],
        geographicSubLocalizationFrench: line[CsvLine.GEOGRAPHIC_SUB_LOCALIZATION_FRENCH],
        geographicSubLocalizationEnglish: line[CsvLine.GEOGRAPHIC_SUB_LOCALIZATION_ENGLISH],
        geographicSubLocalizationSpanish: line[CsvLine.GEOGRAPHIC_SUB_LOCALIZATION_SPANISH],
        regulations: line[CsvLine.REGULATIONS],
        transparency: line[CsvLine.TRANSPARENCY],
        quality: line[CsvLine.QUALITY],
        qualityTer: line[CsvLine.QUALITY_TER],
        qualityGr: line[CsvLine.QUALITY_GR],
        qualityTir: line[CsvLine.QUALITY_TIR],
        qualityC: line[CsvLine.QUALITY_C],
        qualityP: line[CsvLine.QUALITY_P],
        qualityM: line[CsvLine.QUALITY_P],
        frenchComment: line[CsvLine.COMMENT_FRENCH],
        englishComment: line[CsvLine.COMMENT_ENGLISH],
        spanishComment: line[CsvLine.COMMENT_SPANISH],
        postType: line[CsvLine.POST_TYPE],
        frenchPostName: line[CsvLine.POST_NAME_FRENCH],
        englishPostName: line[CsvLine.POST_NAME_ENGLISH],
        spanishPostName: line[CsvLine.POST_NAME_SPANISH],
        cO2f: line[CsvLine.CO2F],
        cH4f: line[CsvLine.CH4F],
        cH4b: line[CsvLine.CH4B],
        n2O: line[CsvLine.N2O],
        codeGazSupplementaire: line[CsvLine.CODE_GAZ_SUPPLEMENTAIRE_1],
        valeurGazSupplementaire: line[CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_1],
        codeGazSupplementaire2: line[CsvLine.CODE_GAZ_SUPPLEMENTAIRE_2],
        valeurGazSupplementaire2: line[CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_2],
        codeGazSupplementaire3: line[CsvLine.CODE_GAZ_SUPPLEMENTAIRE_3],
        valeurGazSupplementaire3: line[CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_3],
        codeGazSupplementaire4: line[CsvLine.CODE_GAZ_SUPPLEMENTAIRE_4],
        valeurGazSupplementaire4: line[CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_4],
        codeGazSupplementaire5: line[CsvLine.CODE_GAZ_SUPPLEMENTAIRE_5],
        valeurGazSupplementaire5: line[CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_5],
        autreGES: line[CsvLine.AUTRE_GES],
        cO2b: line[CsvLine.CO2B],
        wecountNameFrench: line[CsvLine.WECOUNT_NAME_FRENCH],
        wecountNameEnglish: line[CsvLine.WECOUNT_NAME_ENGLISH],
        tag1: line[CsvLine.TAG_1],
        tag2: line[CsvLine.TAG_2],
        tag3: line[CsvLine.TAG_3],
        tag4: line[CsvLine.TAG_4],
        uncertaintyWasUnknownAtIngestionTime: typeof line[CsvLine.UNCERTAINTY] === 'undefined',
      }
    };
  }
}
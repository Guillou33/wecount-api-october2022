import { ComputeMethod, EmissionFactor, EmissionFactorInfo } from "@entity/index";
import AbstractManagerWithRepository from "@root/manager/AbstractManagerWithRepository";
import {
  EmissionFactorRepository,
} from "@repository/index";
import { ArchivedReason, NotVisibleReason, ElementType } from "@root/entity/enum/EmissionFactorEnums";
import { contentManager } from "..";
import { LOCALE } from "@root/entity/enum/Locale";

export interface InfoData {
  infoWecountId?: string;
  infoFesId?: string;
  infoDuplicate?: string;
  infoLabelAdeme?: string;
  infoNomFrontiereFrancais?: string;
  infoNomBaseFrancais?: string;
  infoStatut?: string;
  infoCommentaireInterne?: string;
  infoFormuleSpeciale?: string;
  infoFesAutreBaseCarbone?: string;
  infoEmissionFactorRaw?: string;
  infoUniteBaseCarbone?: string;
  infoHomogeneisationUnite?: string;
  infoUniteCorrigeeTonnes?: string;
  infoIncertitudeCorrigee?: string;
  infoSourceSiAutreQueBC?: string;
  infoCommentaireAdditionelWeCountSurLaSource?: string;
  infoCO2f?: string;
  infoCH4f?: string;
  infoCH4b?: string;
  infoN2O?: string;
  infoCodeGazSupplementaire?: string;
  infoValeurGazSupplementaire?: string;
  infoCodeGazSupplementaire2?: string;
  infoValeurGazSupplementaire2?: string;
  infoCodeGazSupplementaire3?: string;
  infoValeurGazSupplementaire3?: string;
  infoCodeGazSupplementaire4?: string;
  infoValeurGazSupplementaire4?: string;
  infoCodeGazSupplementaire5?: string;
  infoValeurGazSupplementaire5?: string;
  infoAutreGES?: string;
  infoCO2b?: string;
}

class EmissionFactorManager extends AbstractManagerWithRepository<
  EmissionFactor,
  EmissionFactorRepository
> {
  protected entityClass = EmissionFactor;
  protected repositoryClass = EmissionFactorRepository;

  async create(efData: any): Promise<EmissionFactor> {
    const nameContentCode = await contentManager.createAndGetContentCode({
      prefix: 'ef_name',
      text: efData.name,
    });
    await contentManager.createFromContentCode({
      code: nameContentCode,
      text: efData.nameEn,
      locale: LOCALE.EN_GB,
    });

    const sourceContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'ef_source',
      text: efData.source,
    });
    if(sourceContentCode != null){
      await contentManager.createFromContentCode({
        code: sourceContentCode,
        text: efData.sourceEn,
        locale: LOCALE.EN_GB,
      })
    }

    const descriptionContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'ef_description',
      text: efData.description,
    });
    if(descriptionContentCode != null){
      await contentManager.createFromContentCode({
        code: descriptionContentCode,
        text: efData.descriptionEn,
        locale: LOCALE.EN_GB,
      })
    }

    const unitContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'ef_unit',
      text: efData.unit,
    });
    if(unitContentCode != null){
      await contentManager.createFromContentCode({
        code: unitContentCode,
        text: efData.unitEn,
        locale: LOCALE.EN_GB,
      })
    }

    const input1UnitContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'ef_input1_unit',
      text: efData.input1Unit,
    });
    if(input1UnitContentCode != null){
      await contentManager.createFromContentCode({
        code: input1UnitContentCode,
        text: efData.input1UnitEn,
        locale: LOCALE.EN_GB,
      })
    }

    const input2UnitContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'ef_input2_unit',
      text: efData.input2Unit,
    });
    if(input2UnitContentCode != null){
      await contentManager.createFromContentCode({
        code: input2UnitContentCode,
        text: efData.input2UnitEn,
        locale: LOCALE.EN_GB,
      })
    }

    const program = await contentManager.createAndGetNullableContentCode({
      prefix: 'ef_program',
      text: efData.program,
    });
    if(program != null){
      await contentManager.createFromContentCode({
        code: program,
        text: efData.programEn,
        locale: LOCALE.EN_GB,
      })
    }

    const urlProgram = await contentManager.createAndGetNullableContentCode({
      prefix: 'ef_url_program',
      text: efData.urlProgram,
    });
    if(urlProgram != null){
      await contentManager.createFromContentCode({
        code: urlProgram,
        text: efData.urlProgramEn,
        locale: LOCALE.EN_GB,
      })
    }

    const ef = this.instanceFromData({
      ...efData,
      nameContentCode,
      sourceContentCode,
      descriptionContentCode,
      unitContentCode,
      input1UnitContentCode,
      input2UnitContentCode,
      program,
      urlProgram,
      tagIds: [],
    });

    if (efData.emissionFactorInfo != null) {
      const efi = await this.em.save(
        efData.emissionFactorInfo as EmissionFactorInfo
      );
      ef.emissionFactorInfo = efi;
    }
    await this.em.save(ef);

    return ef;
  }

  async archiveEf(ef: EmissionFactor): Promise<EmissionFactor> {
    ef.archived = true;
    ef.archivedReason = ArchivedReason.DEPRECATE;
    return this.em.save(ef);
  }

  async hideEf(ef: EmissionFactor): Promise<EmissionFactor> {
    ef.notVisible = true;
    ef.notVisibleReason = NotVisibleReason.DEPRECATE;
    return this.em.save(ef);
  }

  async getPosteDecomposition(
    emissionFactor: EmissionFactor
  ): Promise<EmissionFactor[]> {
    return this.em.find(EmissionFactor, {
      relations: ["emissionFactorInfo"],
      where: {
        dbId: emissionFactor.dbId,
        dbName: emissionFactor.dbName,
        elementType: ElementType.POSTE,
      },
    });
  }

  async getCombustionParts(emissionFactor: EmissionFactor) {
    const decomposition = await this.getPosteDecomposition(emissionFactor);
    
    return decomposition.reduce(
      (acc, efPoste) => {
        if (efPoste.emissionFactorInfo.postType === "Combustion") {
          acc.combustionCo2b = efPoste.emissionFactorInfo.cO2b ?? 0;
        } else {
          acc.otherCo2b = acc.otherCo2b + (efPoste.emissionFactorInfo.cO2b ?? 0);
        }
        return acc;
      },
      { combustionCo2b: 0, otherCo2b: 0 }
    );
  }
}

export default new EmissionFactorManager();

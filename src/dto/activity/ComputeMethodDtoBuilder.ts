import { ComputeMethod, EmissionFactorMapping, EmissionFactorTagLabel } from "@root/entity";

interface RootEmissionFactorLabelDto extends Omit<EmissionFactorTagLabel, 'childrenLabelMappings' | 'emissionFactorTags'> {
  childrenTagLabels: EmissionFactorTagLabel[]
}
interface ComputeMethodDto extends Omit<ComputeMethod, 'emissionFactorTagLabelMappings'> {
  rootTagLabels: RootEmissionFactorLabelDto[]
  emissionFactorMappings: EmissionFactorMapping[]
};


export default class ComputeMethodDtoBuilder extends ComputeMethod {
  static buildFromFormattedEntity(computeMethod: ComputeMethod): ComputeMethodDto {
    const rootTagLabels = computeMethod.emissionFactorTagLabelMappings.map(eftlm => {
      return this.buildRootEmissionFactorTagLabel(eftlm.emissionFactorTagLabel);
    });

    const emissionFactorMappings = computeMethod?.emissionFactorTagLabelMappings.reduce((efm, eftlm) => {
      return [...efm, ...eftlm?.emissionFactorTagLabel?.emissionFactorMappings ?? []];
    }, [] as EmissionFactorMapping[]);

    const cleanedComputeMethod: any = { ...computeMethod };
    delete cleanedComputeMethod.emissionFactorTagLabelMappings;

    return {
      ...cleanedComputeMethod,
      rootTagLabels,
      emissionFactorMappings,
    } as ComputeMethodDto;
  }

  private static buildRootEmissionFactorTagLabel(tagLabel: EmissionFactorTagLabel) {
    const cleanedTagLabel: any = { ...tagLabel };
    const childrenLabelMappings = tagLabel.childrenLabelMappings ;
    delete cleanedTagLabel.childrenLabelMappings;
    delete cleanedTagLabel.emissionFactorTags;

    return {
      ...cleanedTagLabel,
      childrenTagLabels: childrenLabelMappings.map(clm => clm.childTag),
    } as RootEmissionFactorLabelDto;
  }
}



import { Response } from "express";
import { get, controller, use } from "@deep/routing/decorators";
import { query } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { ComputeMethodRepository, EmissionFactorRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { classToPlain } from "class-transformer";
import { EmissionFactor, EmissionFactorMapping } from "@root/entity";

@controller("/compute-method")
class EmissionFactorController extends BaseController {
  @use([query("search").optional(), expressValidatorThrower])
  @get("/:computeMethodId/emission-factor/autocomplete")
  async autocompleteEmissionFactor(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const computeMethodId = (req.params.computeMethodId as unknown) as number;
    const search = req.query.search as string | undefined;
    
    const computeMethodRepository = this.em.getCustomRepository(
      ComputeMethodRepository
    );
    const computeMethod = await computeMethodRepository.findOne(computeMethodId);

    let plainEmissionFactorMapping: {emissionFactor: EmissionFactor; recommended: boolean}[] = [];
    if (computeMethod?.hasAllEf) {
      const emissionFactors = await this.em.getCustomRepository(EmissionFactorRepository).findAllByText({
        company: user!.company,
        searchText: search,
        customLocale: user?.locale ?? undefined,
      });
      const emissionFactorsDto = classToPlain(emissionFactors, {groups: ["with_ef_tags", "with_dbname"]});
      plainEmissionFactorMapping = emissionFactorsDto.map((ef: EmissionFactor) => ({emissionFactor: ef, recommended: false}));
    } else {
      const computeMethodWithSearchedEfList = await computeMethodRepository.findAllWithEf({
        company: user!.company,
        computeMethodId,
        searchText: search,
        customLocale: user?.locale ?? undefined,
      });
      
      // Can be undefined if no EF matching text is found
      const computeMethodWithSearchedEf = computeMethodWithSearchedEfList.length ? computeMethodWithSearchedEfList[0] : undefined;
      const emissionFactorMappings = computeMethodWithSearchedEf?.emissionFactorTagLabelMappings.reduce((efm, eftlm) => {
        return [...efm, ...eftlm?.emissionFactorTagLabel?.emissionFactorMappings ?? []];
      }, [] as EmissionFactorMapping[]);
      plainEmissionFactorMapping = classToPlain(emissionFactorMappings ?? [], {groups: ["with_ef_tags", "with_dbname"]}) as {emissionFactor: EmissionFactor; recommended: boolean}[];
    }

    res.send(plainEmissionFactorMapping);
  }
}

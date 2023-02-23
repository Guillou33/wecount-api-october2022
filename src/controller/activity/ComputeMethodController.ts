import { Response } from "express";
import { get, controller, use } from "@deep/routing/decorators";
import { query } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { ComputeMethodRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { classToPlain, plainToClass } from "class-transformer";
import ComputeMethodDtoBuilder from "@root/dto/activity/ComputeMethodDtoBuilder";
import { ComputeMethod } from "@root/entity";

@controller("/compute-method")
class ComputeMethodController extends BaseController {
  @use([query("activityModelId").optional().toInt(), expressValidatorThrower])
  @get("")
  async getComputeMethods(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const activityModelId = req.query.activityModelId as number | undefined;

    const computeMethodRepository = this.em.getCustomRepository(
      ComputeMethodRepository
    );
    
    const computeMethods = await computeMethodRepository.findAllWithEfAndTags({
      company: user!.company,
      activityModelId,
      customLocale: user?.locale ?? undefined
    });


    const plainComputeMethods = classToPlain(computeMethods, {
      groups: ["compute_method_with_emission_factor", "with_ef_tag_labels", "with_ef_tags", "with_dbname"],
    });

    const computeMethodsDto = plainComputeMethods.map((cm: ComputeMethod) => ComputeMethodDtoBuilder.buildFromFormattedEntity(cm));
    
    res.send(computeMethodsDto);
  }
}

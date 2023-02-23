import { Request, Response } from "express";
import { get, controller } from "@deep/routing/decorators";
import { ActivityCategoryRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { classToPlain } from 'class-transformer';

@controller("/activity-categories")
class ActivityCategoryController extends BaseController {
  @get("")
  async getCategories(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);

    const activityCategoryRepository = this.em.getCustomRepository(ActivityCategoryRepository);
    const activityCategories = await activityCategoryRepository.findAllWithActivityModels(user!.company, user?.locale ?? undefined);
    
    res.send(classToPlain(activityCategories, {
      groups: ['activity_model_base']
    }));
  }
}

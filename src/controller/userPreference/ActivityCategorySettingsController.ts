import { Response } from "express";
import { body } from "express-validator";
import { get, controller, use, post } from "@deep/routing/decorators";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import activityModelPreferenceManager from "@manager/userPreference/ActivityModelPreferenceManager";
import { classToPlain } from "class-transformer";
import { validatePerimeter } from "../core/helpers/validatePerimeter";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";

@controller("/userPreferences/activityCategories")
export class ActivityCategorySettingsController extends BaseController {
  @use([
    body("perimeterId").exists().toInt(),
    body("categorySettings").isArray(),
    body("categorySettings.*.activityCategoryId").isInt(),
    body("categorySettings.*.order").optional().isInt(),
    body("categorySettings.*.description").optional().isString(),
    expressValidatorThrower,
  ])
  @post("")
  async updateActivityCategorySettings(req: CustomRequest, res: Response) {
    const perimeterId = req.body.perimeterId as number;
    const user = await this.getUser(req, ["company"]);
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireManager();

    const newSettings = (req.body.categorySettings as any[]).map(
      (bodyEntry: any) => {
        const activityCategoryId = bodyEntry.activityCategoryId as number;
        const order = (bodyEntry.order ?? null) as number | null;
        const description = (bodyEntry.description ?? null) as string | null;

        return { activityCategoryId, order, description };
      }
    );

    await activityModelPreferenceManager.upsertCategorySettings(
      perimeter,
      newSettings
    );

    const updatedCategorySettings =
      await activityModelPreferenceManager.getCategorySettingsFor(perimeter);

    res.send(classToPlain(updatedCategorySettings));
  }
}

import { Response } from "express";
import { body } from "express-validator";
import { get, controller, use, post } from "@deep/routing/decorators";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import validateActivityModelUniqueNames from "./helpers/validateActivityModelUniqueNames";
import activityModelPreferenceManager from "@manager/userPreference/ActivityModelPreferenceManager";
import { validatePerimeter } from "../core/helpers/validatePerimeter";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";

@controller("/userPreferences/activityModel")
export class ActivityModelController extends BaseController {
  @use([
    body("visibleActivityModels").exists().isArray(),
    body("perimeterId").exists().toInt(),
    expressValidatorThrower,
  ])
  @post("/")
  async updateActivityModelPreferences(req: CustomRequest, res: Response) {
    const perimeterId = req.body.perimeterId as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireManager();
    
    const activityModels = validateActivityModelUniqueNames(
      req.body.visibleActivityModels
    );
    const newActivityModelPreferences =
      await activityModelPreferenceManager.upsertVisibleActivityModels(
        perimeter,
        activityModels
      );
    res.send({
      visibleActivityModels:
        newActivityModelPreferences.visibleActivityModels.map(
          activityModel => activityModel.uniqueName
        ),
    });
  }
}

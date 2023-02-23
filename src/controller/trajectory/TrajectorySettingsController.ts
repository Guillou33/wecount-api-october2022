import { Response } from "express";
import { classToPlain } from "class-transformer";
import CustomRequest from "@service/core/express/CustomRequest";
import { SCOPE } from "@entity/enum/Scope";

import BaseController from "@controller/BaseController";
import { controller, post, use } from "@deep/routing/decorators";
import { body, param } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import typeOrNull from "@service/utils/typeOrNull";

import { validateTrajectorySettings } from "./helpers/validateTrajectorySettings";
import { trajectorySettingsManager } from "@root/manager/index";

import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";

@controller("/trajectory-settings")
class TrajectoryController extends BaseController {
  @use([
    param("id").exists().toInt(),
    param("scope")
      .exists()
      .custom(value =>
        Object.values(SCOPE)
          .map(scope => scope.toLowerCase())
          .includes(value)
      ),
    body("target")
      .optional()
      .custom(value => typeOrNull("number", value)),
    body("description")
      .optional()
      .custom(value => typeOrNull("string", value)),
    expressValidatorThrower,
  ])
  @post("/:id/scope-targets/:scope")
  async updateScopeTarget(req: CustomRequest, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const scope = req.params.scope as SCOPE;
    const trajectorySettings = await validateTrajectorySettings(id, user!);

    await PerimeterAccessControl.buildFor(user, trajectorySettings.perimeter).requireManager();

    await trajectorySettingsManager.updateScopeTarget(
      scope,
      trajectorySettings,
      req.body
    );

    res.send(classToPlain(trajectorySettings));
  }

  @use([
    param("id").exists().toInt(),
    body("targetYear").exists().toInt(),
    expressValidatorThrower,
  ])
  @post("/:id/target-year")
  async updateTargetYear(req: CustomRequest, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const trajectorySettings = await validateTrajectorySettings(id, user!);

    await PerimeterAccessControl.buildFor(user, trajectorySettings.perimeter).requireManager();

    const targetYear = (req.body.targetYear as unknown) as number

    await trajectorySettingsManager.updateTargetYear(trajectorySettings, targetYear);

    res.send(classToPlain(trajectorySettings));
  }
}

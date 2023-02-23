import { Response } from "express";
import "express-async-errors";
import {
  controller,
  bodyValidator,
  post,
  asyncHandle,
  use,
} from "@deep/routing/decorators";
import only from '@service/core/security/auth/customAuthorizationMiddleware';
import { ROLES } from '@service/core/security/auth/config/index';
import CustomRequest from "@service/core/express/CustomRequest";
import { userManager } from "@manager/index";
import BaseController from "@controller/BaseController";
import { body } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import Mail from '@service/core/mail/Mail';
import ejs from 'ejs';
import config from "config";
import { LOCALE } from "@root/entity/enum/Locale";
import translations from "@root/translations/translations";
const baseFrontUrl: string = config.get('baseFrontUrl');

@controller("")
class SignupController extends BaseController {
  @post("/admin/account-creation")
  @use([
    body("email").isEmail().normalizeEmail(),
    body("profile.firstName")
      .exists()
      .isLength({ min: 1 })
      .withMessage("First name must have min 1 character"),
    body("profile.lastName")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Last name must have min 1 character"),
    body("company.name")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Company must have min 1 character"),
    body("locale")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Campaign name must have min 1 character"),
    expressValidatorThrower,
  ])
  async createAccount(req: CustomRequest, res: Response) {
    const userData: {
      email: string;
      profile: { firstName: string; lastName: string };
      company: { name: string };
      perimeter: null;
      locale: LOCALE;
    } = req.body;

    const user = await userManager.createNew({
      ...userData,
      roles: [ROLES.ROLE_MANAGER],
      customLocale: userData.locale,
    }, true, true);
    await userManager.setResetPasswordToken(user, true);

    const mailResetPassword = Mail.buildDefault();

    ejs.renderFile(`templates/mail/auth/${translations[userData.locale].templateNames.onboard}.ejs`, {
      url: `${baseFrontUrl}/set-password/${user.resetPasswordToken}`
    }, {}, async function(err, html) {
      await mailResetPassword
        .addTo(user.email)
        .setSubject(translations[userData.locale].mails.newAccount.subject)
        .setHtml(html)
        .send();

      res.status(201).send({});
    });
  }
}

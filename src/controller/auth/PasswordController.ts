import { Request, Response } from "express";
import {
  get,
  controller,
  post,
  use,
} from "@deep/routing/decorators";
import BaseController from "@controller/BaseController";
import { body, param } from 'express-validator';
import expressValidatorThrower from '@service/core/error/middleware/expressValidatorThrower';
import { User } from "@entity/index";
import { userManager } from "@manager/index";
import NotFoundError from "@deep/responseError/NotFoundError";
import CustomError from "@deep/responseError/CustomError";
import PasswordHandler from "@service/core/security/password/PasswordHandler";
import Mail from '@service/core/mail/Mail';
import ejs from 'ejs';
import config from "config";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import translations from "@root/translations/translations";
const baseFrontUrl: string = config.get('baseFrontUrl');

@controller("/auth")
class PasswordController extends BaseController {
  @post("/reset-password/send")
  @use([
    body('email').isEmail().normalizeEmail(),
    expressValidatorThrower
  ])
  async sendResetPasswordLink(req: Request, res: Response) {
    const { email } = req.body;

    const user = await this.em.findOne(User, {
      email,
    });
    if (!user) {
      throw new CustomError({statusCode: 400, message: 'User does not exist'});
    }
    const locale = user.locale ?? fallbackLocale;

    await userManager.setResetPasswordToken(user, true);

    const mailResetPassword = Mail.buildDefault();

    ejs.renderFile(`templates/mail/auth/${translations[locale].templateNames.resetPassword}.ejs`, {
      url: `${baseFrontUrl}/reset-password/${user.resetPasswordToken}`
    }, {}, async function(err, html) {
      await mailResetPassword
        .addTo(user.email)
        .setSubject(translations[locale].mails.password.reset)
        .setHtml(html)
        .send();

      res.send({});
    });
  }

  @get("/reset-password/reset/:resetPasswordToken")
  @use([
    param("resetPasswordToken").exists(),
    expressValidatorThrower
  ])
  async resetPasswordGet(req: Request, res: Response) {
    const resetPasswordToken = req.params.resetPasswordToken;

    const user = await this.em.findOne(User, {
      resetPasswordToken,
    });
    if (!user) {
      throw new NotFoundError();
    }

    res.send({});
  }

  @post("/reset-password/reset/:resetPasswordToken")
  @use([
    param("resetPasswordToken").exists(),
    body("password")
      .trim(),
    expressValidatorThrower
  ])
  async resetPasswordReset(req: Request, res: Response) {
    const resetPasswordToken = req.params.resetPasswordToken;
    const { password } = req.body;

    const user = await this.em.findOne(User, {
      resetPasswordToken,
    });
    if (!user) {
      throw new CustomError({statusCode: 400, message: 'User does not exist'});
    }
    if (!PasswordHandler.securityLevelAccepted(password)) {
      throw new CustomError({statusCode: 400, message: 'Password is malformed'});
    }

    user.password = await PasswordHandler.hash(password);
    user.resetPasswordToken = null;
    await this.em.save(user);

    res.send({});
  }

  @post("/set-password/:resetPasswordToken")
  @use([
    param("resetPasswordToken").exists(),
    body("password")
      .trim(),
    body("locale"),
    body("acceptCgvu"),
    expressValidatorThrower
  ])
  async setPassword(req: Request, res: Response) {
    const resetPasswordToken = req.params.resetPasswordToken;
    const { password, acceptCgvu, locale } = req.body;

    const user = await this.em.findOne(User, {
      resetPasswordToken,
    });
    if (!user) {
      throw new CustomError({statusCode: 400, message: 'User does not exist'});
    }
    if (!PasswordHandler.securityLevelAccepted(password)) {
      throw new CustomError({statusCode: 400, message: 'Password is malformed'});
    }

    if (acceptCgvu !== 1) {
      throw new CustomError({statusCode: 403, message: 'Forbidden'});
    }

    user.password = await PasswordHandler.hash(password);
    user.acceptCgvu = true;
    user.resetPasswordToken = null;
    userManager.setLocale(user, locale, false);
    await this.em.save(user);

    res.send({});
  }
}

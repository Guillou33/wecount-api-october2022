import { Request, Response } from "express";
import {
  get,
  controller,
  post,
  use,
} from "@deep/routing/decorators";
import only from "@service/core/security/auth/customAuthorizationMiddleware";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import PasswordHandler from "@service/core/security/password/PasswordHandler";
import { body } from 'express-validator';
import expressValidatorThrower from '@service/core/error/middleware/expressValidatorThrower';
import { User, RefreshToken } from "@entity/index";
import { userManager } from "@manager/index";
import { ROLES } from "@service/core/security/auth/config/index";
import NotFoundError from "@deep/responseError/NotFoundError";
import CustomError from "@deep/responseError/CustomError";
import { TIME_USER_BLOCKED_FOR_PASSWORD_ERRORS } from "@root/manager/auth/userManager";

@controller("/auth")
class LoginController extends BaseController {

  @post("/login")
  @use([
    body('email').isEmail().normalizeEmail(),
    body('password').trim(),
    expressValidatorThrower
  ])
  async postLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await this.em.findOne(User, { 
      email
    });

    if (!user) {
      throw new CustomError({
        message: 'unfound_user',
        statusCode: 401
      });
    }


    if (user.lastPasswordErrorAt && user.consecutivePasswordErrors >= 5) {
      if ((new Date).getTime() - user.lastPasswordErrorAt.getTime() < TIME_USER_BLOCKED_FOR_PASSWORD_ERRORS) {
        throw new CustomError({
          message: 'too_many_password_errors',
          statusCode: 401
        });
      } else {
        userManager.resetPasswordErrors(user);
      }
    }

    if (!(await userManager.canLogin(user))) {
      throw new CustomError({
        message: 'unauthorized',
        statusCode: 401
      });
    }

    const userHash = user.password;

    if (!userHash) {
      throw new CustomError({
        message: 'bad_credentials',
        statusCode: 401
      });
    }
    const isPasswordValid = await PasswordHandler.isValid(password, userHash);
    if (!isPasswordValid) {
      userManager.addPasswordError(user);
      throw new CustomError({
        message: 'bad_credentials',
        statusCode: 401
      });
    }

    if (user.lastPasswordErrorAt) {
      userManager.resetPasswordErrors(user);
    }

    const tokens = await userManager.getTokens(user, true);

    res.send({
      ...tokens,
    });
  }

  @post("/refresh")
  @use([
    body('refreshToken').exists(),
    expressValidatorThrower
  ])
  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    // TODO THOMAS ONLY NOT EXPIRED !!!
    const refreshTokenEntity = await this.em.findOne(
      RefreshToken,
      { token: refreshToken },
      { relations: ["user"] },
    );


    if (!refreshTokenEntity) {
      throw new CustomError({statusCode: 400, message: 'Wrong refresh token or expired'});
    }

    const user = refreshTokenEntity.user;

    if (!(await userManager.canLogin(user))) {
      throw new CustomError({
        message: 'User is unauthorized',
        statusCode: 400
      });
    }

    const tokens = await userManager.getTokens(user, true);
    res.send({
      ...tokens,
    });
  }

  @post("/impersonate")
  @use(only([ROLES.ROLE_CONSULTANT]))
  @use([
    body('email').isEmail().normalizeEmail(),
    expressValidatorThrower
  ])
  async impersonate(req: Request, res: Response) {
    const { email } = req.body;

    const user = await this.em.findOne(User, {
      email,
    });

    if (!user || user.isAdmin()) {
      throw new NotFoundError();
    }

    const tokens = await userManager.getTokens(user, true, true);
    res.send({
      ...tokens,
    });
  }
}

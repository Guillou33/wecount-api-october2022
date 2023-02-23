import { Response } from 'express';
import { controller, get, use, asyncHandle } from '@deep/routing/decorators';
import CustomRequest from '@service/core/express/CustomRequest';
import { RefreshTokenRepository } from '@repository/index';
import only from '@service/core/security/auth/customAuthorizationMiddleware';
import { ROLES } from '@service/core/security/auth/config';
import {getCustomRepository} from "typeorm";
import { RefreshToken } from "@entity/index";
import BaseController from '@controller/BaseController';

@controller('')
class TestController extends BaseController {

  @get('/test')
  @use(only([ROLES.ROLE_USER]))
  async testConnected(req: CustomRequest, res: Response): Promise<void> {
    const user = await this.getUser(req);
    if (user) {
      const refreshTokenRepository = getCustomRepository(RefreshTokenRepository);
      const refreshToken = await refreshTokenRepository.findLastForUser(user);
    }
    
    res.send({
        test: true,
        number: 2,
    });
  }
}

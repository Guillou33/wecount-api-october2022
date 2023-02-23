import { Response, NextFunction, RequestHandler } from 'express';
import { User } from '@entity/auth/User';
import CustomRequest from '@service/core/express/CustomRequest';
import { getManager, EntityManager, JoinOptions } from "typeorm";

export default abstract class BaseController {
  private rawEm: EntityManager;

  protected get em(): EntityManager {
    if (!this.rawEm) {
      this.rawEm = getManager();
    }
    
    return this.rawEm;
  }

  async getUser(req: CustomRequest, directJoins?: string[]): Promise<User | undefined> {
    
    if (!req.userAuthInfo || !req.userAuthInfo.id) {
      return;
    }

    let joinList: {[key: string]: any} | undefined;
    let joinOptions: {join: JoinOptions} | {} = {};
    const alias = 'u';
    if (directJoins?.length) {
      joinList = {};

      directJoins.forEach((directJoin): void => {
        joinList![directJoin] = `${alias}.${directJoin}`;
      });

      joinOptions = {
        join: {
          alias: "u",
          leftJoinAndSelect: joinList,
        }
      }
    }

    const user = await this.em.findOne(User, req.userAuthInfo.id, joinOptions);

    return user;
  }

  userIsImpersonated(req: CustomRequest): boolean {
    return req.userAuthInfo?.isImpersonation ?? false;
  }
}

import { Response } from 'express';
import CustomRequest from '@service/core/express/CustomRequest';
import { roleManager } from "@service/core/security/auth/RoleManager";
import { ROLES } from '@service/core/security/auth/config';

export default abstract class AbstractAuthorizationMiddleware {

  protected static isGrantedOneOf(req: CustomRequest, roles: ROLES[]): boolean {
    let userRoles: ROLES[];
    if (!req.userAuthInfo) {
      userRoles = [ROLES.ROLE_ANONYMOUS];
    } else {
      userRoles = req.userAuthInfo.roles;
    }
    
    let hasAccess = false
    roles.forEach((role) => {
      if (roleManager.isGranted({roles: userRoles}, role)) {
        hasAccess = true;
      }
    });

    return hasAccess;
  }

  protected static sendAccessBlocked(res: Response): void {
    res.status(403).send({
      reject_reason: "access_forbidden",
    });
  }
}
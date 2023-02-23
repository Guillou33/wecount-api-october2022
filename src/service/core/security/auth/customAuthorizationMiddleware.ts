import { Response, NextFunction } from 'express';
import CustomRequest from '@service/core/express/CustomRequest';
import { ROLES } from '@service/core/security/auth/config';
import AbstractAuthorizationMiddleware from '@service/core/security/auth/AbstractAuthorizationMiddleware';

class CustomAuthorizationMiddleware extends AbstractAuthorizationMiddleware {

  static only(rolesGrantingAccess: ROLES[]) {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
      if (!CustomAuthorizationMiddleware.isGrantedOneOf(req, rolesGrantingAccess)) {
        CustomAuthorizationMiddleware.sendAccessBlocked(res);
        return;
      }
      next();
    };
    
  }
}

export default CustomAuthorizationMiddleware.only;

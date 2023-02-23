import { Response, NextFunction } from 'express';
import CustomRequest from '@service/core/express/CustomRequest';
import { ACCESS_CONTROL_LIST } from '@service/core/security/auth/config';
import AbstractAuthorizationMiddleware from '@service/core/security/auth/AbstractAuthorizationMiddleware';

class AclAuthorizationMiddleware extends AbstractAuthorizationMiddleware {
  static acl = [...ACCESS_CONTROL_LIST];

  static middleware(req: CustomRequest, res: Response, next: NextFunction): void {
    // On transpose le tableau pour avoir les priorités les plus basses dans le tableau en premier
    const requestPath = req.path;
    
    const aclMatched = AclAuthorizationMiddleware.acl.find(({ path }) => {
      const currentPathRegex = new RegExp(path);
      return currentPathRegex.test(requestPath);
    });

    if (!aclMatched) {
      next();
      return;
    }

    const rolesMatchingAcl = aclMatched.roles;

    if (!AclAuthorizationMiddleware.isGrantedOneOf(req, rolesMatchingAcl)) {
      AclAuthorizationMiddleware.sendAccessBlocked(res);
      return;
    }
    next();
  }
}

export default AclAuthorizationMiddleware.middleware;

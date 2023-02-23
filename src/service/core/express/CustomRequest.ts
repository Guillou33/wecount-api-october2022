import { Request } from 'express';
import { ROLES } from '@service/core/security/auth/config';
import { LOCALE } from '@root/entity/enum/Locale';

export default interface CustomRequest extends Request {
  userAuthInfo?: {
    id: number,
    email: string,
    roles: ROLES[],
    locale: LOCALE | null,
    isImpersonation: boolean,
  }
}
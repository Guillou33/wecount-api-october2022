import { LOCALE } from "@root/entity/enum/Locale";
import MockTokenHandler from "@root/test/mock/MockTokenHandler";
import { ROLES } from '@service/core/security/auth/config/index';

export const getJwtUser = ({
  roles,
  id,
  email,
  locale,
}: {
  roles?: ROLES[];
  id?: number;
  email?: string;
  locale?: LOCALE;
}={}) => {
  return MockTokenHandler.create({
    id: id ?? 1,
    email: email ?? "thomas@weepulse.fr",
    roles: roles ?? [ROLES.ROLE_USER],
    locale: LOCALE.FR_FR,
  });
};

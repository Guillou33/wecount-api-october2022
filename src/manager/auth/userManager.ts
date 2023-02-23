import { User, Campaign, Company, Perimeter, UserRoleWithinPerimeter } from "@entity/index";
import AbstractManagerWithRepository from "@manager/AbstractManagerWithRepository";
import PasswordHandler from "@service/core/security/password/PasswordHandler";
import refreshTokenManager from "@manager/auth/refreshTokenManager";
import TokenHandler from "@service/core/security/auth/TokenHandler";
import RequestFiedError from "@deep/responseError/RequestFieldError";
import {
  profileManager,
  companyManager,
  campaignManager,
  perimeterManager,
} from "@manager/index";
import { uid } from "rand-token";
import { UserRepository, CompanyRepository } from "@repository/index";
import { ROLES, PERIMETER_ROLES } from "@root/service/core/security/auth/config";
import { roleManager } from "@root/service/core/security/auth/RoleManager";
import { toPerimeterRole } from "@root/entity/enum/PerimeterRole";
import { CampaignType } from "@root/entity/enum/CampaignType";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";

const THRESHOLD_PASSWORD_ERROR = 1000 * 60;
export const MAX_CONSECUTIVE_LOGIN_ATTEMPTS = 5;
export const TIME_USER_BLOCKED_FOR_PASSWORD_ERRORS = 1000 * 60 * 3;
class UserManager extends AbstractManagerWithRepository<User, UserRepository> {
  protected entityClass = User;
  protected repositoryClass = UserRepository;

  private async checkUniqueUserWithEmail(email: string) {
    return (await this.em.count(User, { email })) === 0;
  }

  async createNew(
    data: {
      email: string;
      password?: string;
      profile: { firstName: string; lastName: string };
      company: { name: string } | Company;
      perimeter: Perimeter | null;
      roles?: ROLES[];
      customLocale?: LOCALE,
    },
    flush: boolean = false,
    withCampaign: boolean = false,
  ): Promise<User> {
    const locale = data.customLocale ?? fallbackLocale;
    if (!(await this.checkUniqueUserWithEmail(data.email))) {
      throw new RequestFiedError([
        {
          message: "existing_email",
          field: "email",
        },
      ]);
    }

    const user = this.instance();
    user.email = data.email;
    if (data.password) {
      user.password = await PasswordHandler.hash(data.password);
    }

    const refreshToken = await refreshTokenManager.createNew(user);

    const profile = await profileManager.createNew({
      firstName: data.profile.firstName,
      lastName: data.profile.lastName,
    });
    const company =
      data.company instanceof Company
        ? data.company
        : await companyManager.createNew({ name: data.company.name });
    user.company = company;
    user.profile = profile;

    const perimeter =
      data.perimeter ?? (await perimeterManager.createNew({ company }));

    if (data.roles) {
      data.roles.forEach(role => {
        user.addRole(role);
      });
    }

    let translatedCampaignName: string;
    switch (locale) {
      case LOCALE.EN_GB:
        translatedCampaignName = "My first campaign";
        break;
      default:
        translatedCampaignName = "Ma première campagne";
        break;
    }
    let campaign: Campaign | undefined;
    if (withCampaign) {
      campaign = await campaignManager.createNew({
        name: translatedCampaignName,
        perimeter,
        type: CampaignType.CARBON_FOOTPRINT,
        year: (new Date()).getFullYear(),
      });
    }

    if (flush) {
      await this.em.transaction(async tem => {
        await tem.save(profile);
        await tem.save(company);
        await tem.save(perimeter);
        await tem.save(user);
        await tem.save(refreshToken);
        if (campaign) {
          await tem.save(campaign);
        }
      });
    }

    return user;
  }

  async getTokens(
    user: User,
    regenerateRefresh: boolean = false,
    isImpersonation: boolean = false
  ): Promise<{
    jwtToken: string;
    refreshToken: string;
    refreshTokenExpirationDate: Date;
  }> {
    if (regenerateRefresh) {
      await refreshTokenManager.createNew(user, true);
    }

    const refreshToken = await refreshTokenManager
      .getRepository()
      .findLastForUser(user, true);

    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    return {
      jwtToken: TokenHandler.create(user, isImpersonation),
      refreshToken: refreshToken.token,
      refreshTokenExpirationDate: refreshToken.expirationDate,
    };
  }

  async setResetPasswordToken(
    user: User,
    flush: boolean = false
  ): Promise<void> {
    const token = uid(32);
    user.resetPasswordToken = token;

    if (flush) {
      await this.em.save(user);
    }
  }

  async archive(user: User, flush: boolean = true): Promise<void> {
    user.archived = true;
    if (flush) {
      await this.em.save(user);
    }
  }

  async unarchive(user: User, flush: boolean = true): Promise<void> {
    user.archived = false;
    if (flush) {
      await this.em.save(user);
    }
  }

  async canLogin(user: User): Promise<boolean> {
    const companyRepository = this.em.getCustomRepository(CompanyRepository);
    const company = await companyRepository.findByUser(user);

    if (user.archived || !company || company.lockedDate) {
      return false;
    }
    return true;
  }

  async getByEmail({
    email,
    withDeleted = false,
  }: {
    email: string;
    withDeleted?: boolean;
  }): Promise<User | undefined> {
    return this.em.findOne(User, {
      relations: ["company", "profile"],
      where: { email },
      withDeleted,
    });
  }

  async getRoleWithinPerimeter(
    user: User,
    perimeter: Perimeter
  ): Promise<PERIMETER_ROLES> {
    if (user.company == null || perimeter.company == null) {
      throw new Error("company must exists on both user and perimeter");
    }
    if (
      roleManager.isGranted({ roles: user.getRoles() }, ROLES.ROLE_MANAGER) &&
      user.company.id === perimeter.company.id
    ) {
      return PERIMETER_ROLES.PERIMETER_ADMIN;
    }
    const userRoleWithinPerimeter = await this.em.findOne(
      UserRoleWithinPerimeter,
      {
        where: {
          perimeter,
          user,
        },
      }
    );
    return toPerimeterRole(userRoleWithinPerimeter?.role);
  }

  addPasswordError(user: User, flush: boolean = true) {
    const currentDate = new Date();
    if (user.lastPasswordErrorAt?.getTime() && (currentDate.getTime() - user.lastPasswordErrorAt?.getTime()) > THRESHOLD_PASSWORD_ERROR) {
      user.consecutivePasswordErrors = 1;
    } else {
      user.consecutivePasswordErrors = user.consecutivePasswordErrors + 1;
    }
    user.lastPasswordErrorAt = currentDate;

    if (flush) {
      this.em.save(user);
    }
  }

  resetPasswordErrors(user: User, flush: boolean = true) {
    user.consecutivePasswordErrors = 0;
    user.lastPasswordErrorAt = null;

    if (flush) {
      this.em.save(user);
    }
  }

  setLocale(user: User, locale: string, flush: boolean = true): void {
    if (!Object.values(LOCALE).includes(locale as any)) {
      return;
    }
    user.locale = locale as LOCALE;
    if (flush) {
      this.em.save(user);
    }
  }
}

export default new UserManager();

import {
  Perimeter,
  Company,
  User,
  ActivityCategorySetting,
  Site,
  Product,
  Campaign,
  TrajectorySettings,
  UserRoleWithinPerimeter,
  EntryTag,
  ActivityCategory,
  ActivityEntry,
} from "@entity/index";
import AbstractManager from "@manager/AbstractManager";
import AbstractManagerWithRepository from "@root/manager/AbstractManagerWithRepository";
import activityModelPreferenceManager from "@manager/userPreference/ActivityModelPreferenceManager";
import { trajectorySettingsManager } from "@manager/index";
import { ASSIGNABLE_PERIMETER_ROLE } from "@entity/enum/PerimeterRole";
import activityEntryManager from "@manager/activity/activityEntryManager";
import { toPerimeterRole } from "@entity/enum/PerimeterRole";
import {
  ROLES,
  PERIMETER_ROLES,
} from "@service/core/security/auth/config/index";
import { SiteRepository, SitesWithSubs } from "@root/repository/core/SiteRepository";

type CartographySettings = {
  visibleActivityModels: string[];
  categorySettings: ActivityCategorySetting[];
};

class PerimeterManager extends AbstractManager<Perimeter> {
  protected entityClass = Perimeter;

  async createNew(
    perimeterInfo: { company: Company; name?: string; description?: string },
    flush: boolean = false
  ): Promise<Perimeter> {
    const perimeter = this.instance();
    perimeter.name = perimeterInfo.name ?? perimeterInfo.company.name;
    perimeter.company = perimeterInfo.company;
    perimeter.description = perimeterInfo.description ?? null;

    if (flush) {
      await this.em.save(perimeter);
    }

    return perimeter;
  }

  async update(
    perimeter: Perimeter,
    perimeterInfo: { name: string; description?: string }
  ): Promise<Perimeter> {
    perimeter.name = perimeterInfo.name;
    perimeter.description = perimeterInfo.description ?? null;

    return this.em.save(perimeter);
  }

  async softDelete(perimeter: Perimeter) {
    return this.em.softRemove(perimeter);
  }

  async findAllForUser(user: User): Promise<Perimeter[]> {
    const queryBuilder = this.em
      .createQueryBuilder(Perimeter, "p")
      .innerJoin(UserRoleWithinPerimeter, "urwp", "urwp.perimeter_id=p.id")
      .innerJoin(User, "u", "u.id = urwp.user_id AND u.id = :userId", {
        userId: user.id,
      });
    return queryBuilder.getMany();
  }

  async findAllForManager(user: User): Promise<Perimeter[]> {
    return this.em.find(Perimeter, {
      relations: ["company"],
      where: {
        company: { id: user.company.id },
      },
    });
  }

  async getEmissions(user: User): Promise<Perimeter[]>{
    const perimeters = this.em.createQueryBuilder(Perimeter, "p")
      .leftJoinAndSelect("p.campaigns", "campaign")
      .select([
        'p.id',
        'p.name',
        'p.description',
        'campaign.id',
        'campaign.name',
        'campaign.type',
        'campaign.year',
        'campaign.status',
        'campaign.resultTco2Upstream',
        'campaign.resultTco2Core',
        'campaign.resultTco2Downstream',
        'campaign.resultTco2UpstreamForTrajectory',
        'campaign.resultTco2CoreForTrajectory',
        'campaign.resultTco2DownstreamForTrajectory',
      ])
      .where("\
        p.company_id = :id and \
        campaign.soft_deleted_at IS NULL and \
        p.soft_deleted_at IS NULL\
      ", { id: user.company.id });

    return perimeters.getMany();
  }

  async getActivities(user:User){
    const perimeters = this.em.createQueryBuilder(Campaign, "c")
      .leftJoinAndSelect("c.perimeter", "p")
      .innerJoin("c.activities", "a")
      .innerJoinAndSelect("a.activityEntries", "ae")
      .innerJoinAndSelect("a.activityModel", "am")
      .innerJoinAndSelect("am.activityCategory", "ac")
      .select([
        "p.id",
        "c.id",
        "a.id",
        "am.id",
        "ac.id",
        "ac.scope",
        "ae.id",
        "ae.resultTco2"
      ])
      .where("\
        p.company_id = :id\
        AND a.status != 'ARCHIVED'\
        AND a.soft_deleted_at IS NULL\
        AND ae.soft_deleted_at IS NULL\
        AND c.soft_deleted_at IS NULL\
      ", { id: user.company.id })
      .addSelect(
            "CASE\
            WHEN\
                ae.is_excluded_from_trajectory = 0\
            THEN\
                SUM(ae.result_tco2)\
            ELSE\
                0\
            END AS tco2Included,\
        CASE\
            WHEN\
                ae.is_excluded_from_trajectory = 1\
            THEN\
                SUM(ae.result_tco2)\
            ELSE\
                0\
            END AS tco2Excluded,\
        CASE\
            WHEN\
                ae.is_excluded_from_trajectory = 0\
            THEN\
                COUNT(ae.id)\
            ELSE\
                0\
            END AS nbrEntriesIncluded,\
        CASE\
            WHEN\
                ae.is_excluded_from_trajectory = 1\
            THEN\
                COUNT(ae.id)\
            ELSE\
                0\
            END AS nbrEntriesExcluded")
        .groupBy("p.id, c.id, ac.id,  am.id, ac.scope, ae.id");

    return perimeters.getMany();
  }

  async getSites(perimeter: Perimeter): Promise<SitesWithSubs[]> {
    const perimeterWithSites = await this.em.findOne(Perimeter, {
      relations: ["sites", "sites.subSites"], 
      where: { 
        id: perimeter.id,
      },
    });
    const allSites: Promise<SitesWithSubs>[] = perimeterWithSites?.sites.map(async site => {

      const subSitesTco2 = site?.subSites.map(async subSite => {
        return {
          ...subSite,
        }
      }) ?? [];

      const subSitesWithTco2 = await Promise.all(subSitesTco2);

      return {
        ...site,
        subSites: subSitesWithTco2
      };
    }) ?? [];

    const sitesWithSubs = await Promise.all(allSites);

    return sitesWithSubs ?? [];
  }

  async getProducts(perimeter: Perimeter): Promise<Product[]> {
    const perimeterWithProducts = await this.em.findOne(Perimeter, {
      relations: ["products"],
      where: { id: perimeter.id },
    });
    return perimeterWithProducts?.products ?? [];
  }

  async getEntryTags(perimeter: Perimeter): Promise<EntryTag[]> {
    const perimeterWithEntryTags = await this.em.findOne(Perimeter, {
      relations: ["entryTags"],
      where: { id: perimeter.id },
    });
    return perimeterWithEntryTags?.entryTags ?? [];
  }

  async getCampaigns(perimeter: Perimeter): Promise<Campaign[]> {
    return this.em.find(Campaign, {
      relations: ["perimeter", "trajectories"],
      where: { perimeter: { id: perimeter.id } },
    });
  }

  async getCartographySettings(
    perimeter: Perimeter
  ): Promise<CartographySettings> {
    const [visibleActivityModels, categorySettings] = await Promise.all([
      activityModelPreferenceManager.getVisibleActivityModelsFor(perimeter),
      activityModelPreferenceManager.getCategorySettingsFor(perimeter),
    ]);
    const cartographySettings = {
      visibleActivityModels: visibleActivityModels.map(
        activityModel => activityModel.uniqueName!
      ),
      categorySettings,
    };
    return cartographySettings;
  }

  async getTrajectorySettings(
    perimeter: Perimeter
  ): Promise<TrajectorySettings> {
    let trajectorySettings = await this.em.findOne(TrajectorySettings, {
      relations: ["perimeter", "scopeTargets"],
      where: { perimeter: { id: perimeter.id } },
    });
    if (trajectorySettings == null) {
      trajectorySettings = await trajectorySettingsManager.createNew(perimeter);
    }
    return trajectorySettings;
  }

  async setUserRole(
    perimeter: Perimeter,
    user: User,
    role: ASSIGNABLE_PERIMETER_ROLE
  ) {
    let userRoleWithinPerimeter = await this.em.findOne(
      UserRoleWithinPerimeter,
      {
        where: { perimeter, user },
      }
    );
    if (userRoleWithinPerimeter == null) {
      userRoleWithinPerimeter = this.em.create(UserRoleWithinPerimeter, {
        perimeter,
        user,
      });
    }
    userRoleWithinPerimeter.role = role;
    return this.em.save(userRoleWithinPerimeter);
  }

  async findUserRoleWithinPerimeter(
    perimeterId: number,
    userId: number
  ): Promise<UserRoleWithinPerimeter | undefined> {
    return this.em.findOne(UserRoleWithinPerimeter, {
      relations: ["perimeter", "user"],
      where: {
        perimeter: {
          id: perimeterId,
        },
        user: {
          id: userId,
        },
      },
    });
  }

  async updateUserRole(
    userRoleWithinPerimeter: UserRoleWithinPerimeter,
    newRole: ASSIGNABLE_PERIMETER_ROLE
  ) {
    const wasUserManager =
      toPerimeterRole(userRoleWithinPerimeter.role) ===
      PERIMETER_ROLES.PERIMETER_MANAGER;
    if (
      wasUserManager &&
      [
        ASSIGNABLE_PERIMETER_ROLE.PERIMETER_COLLABORATOR,
        ASSIGNABLE_PERIMETER_ROLE.PERIMETER_CONTRIBUTOR,
      ].indexOf(newRole) !== -1
    ) {
      await activityEntryManager.revokeOwnershipOfUser(userRoleWithinPerimeter.user);
    }
    userRoleWithinPerimeter.role = newRole;
    return this.em.save(userRoleWithinPerimeter);
  }

  async getUserRoleWithinPerimeter(
    perimeter: Perimeter
  ): Promise<UserRoleWithinPerimeter[]> {
    return this.em.find(UserRoleWithinPerimeter, {
      relations: ["user", "perimeter", "user.profile"],
      where: {
        perimeter: {
          id: perimeter.id,
        },
      },
    });
  }

  async getAdmins(perimeter: Perimeter): Promise<User[]> {
    const qb = this.em.createQueryBuilder(User, "user");
    qb.leftJoinAndSelect("user.profile", "profile")
      .leftJoinAndSelect("user.company", "company")
      .where(
        "user.company.id=:companyId AND (user.roles LIKE :roleAdmin OR user.roles LIKE :roleManager)",
        {
          companyId: perimeter.company.id,
          roleAdmin: `%${ROLES.ROLE_ADMIN}%`,
          roleManager: `%${ROLES.ROLE_MANAGER}%`,
        }
      );
    return qb.getMany();
  }
}

export default new PerimeterManager();

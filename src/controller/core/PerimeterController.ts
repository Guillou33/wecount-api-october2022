import { Response } from "express";
import CustomRequest from "@service/core/express/CustomRequest";
import { param, body } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import typeOrNull from "@service/utils/typeOrNull";
import { classToClass, classToPlain } from "class-transformer";
import ejs from "ejs";
import config from "config";

import Mail from "@root/service/core/mail/Mail";
import BaseController from "@controller/BaseController";
import { get, controller, post, use, put, del } from "@deep/routing/decorators";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";

import { perimeterManager, userManager, campaignManager, siteManager } from "@root/manager";

import { validatePerimeter } from "./helpers/validatePerimeter";

import { ASSIGNABLE_PERIMETER_ROLE } from "@root/entity/enum/PerimeterRole";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";
import { ROLES, PERIMETER_ROLES } from "@root/service/core/security/auth/config";
import { roleManager } from "@root/service/core/security/auth/RoleManager";
import only from '@service/core/security/auth/customAuthorizationMiddleware';
import { CampaignType } from "@root/entity/enum/CampaignType";
import Analytics from "@root/service/core/analytics/Analytics";
import { CampaignStatus } from "@root/entity/enum/CampaignStatus";
import { perimeterRoleManager } from "@root/service/core/security/auth/RoleManager";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import translations from "@root/translations/translations";
import { Perimeter, Site } from "@root/entity";
import { PerimeterRepository, SiteRepository, SitesWithSubs } from "@repository/index";
import { getManager } from "typeorm";
import { multipleSiteDataValidator, SiteData } from "./helpers/multipleSitesData";

const baseFrontUrl: string = config.get('baseFrontUrl');

@controller("/perimeters")
class CompanyController extends BaseController {
  @get("")
  async getAllForUser(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    if (!user) throw new Error("Undefined user");

    let perimeters;
    if (roleManager.isGranted({ roles: user.getRoles() }, ROLES.ROLE_MANAGER)) {
      perimeters = await perimeterManager.findAllForManager(user);
    } else {
      perimeters = await perimeterManager.findAllForUser(user);
    }

    res.send(classToPlain(perimeters));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id")
  async getPerimeter(req: CustomRequest, res: Response) {
    const perimeterId = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireContributor();

    res.send(classToPlain(perimeter));
  }
  
  @get("/emissions/synthesis")
  async getPerimeterEmissions(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    if (!user) throw new Error("Undefined user");

    let perimeters;
    let activities;

    const em = getManager();
    const perimeterRepository = em.getCustomRepository(PerimeterRepository);
    
    if (roleManager.isGranted({ roles: user.getRoles() }, ROLES.ROLE_MANAGER)) {
      perimeters = await perimeterManager.getEmissions(user);
      activities = await perimeterRepository.getCategoriesAndActivityModelsEntries(user);
    }

    res.send({
      activities: activities,
      synthesis: perimeters
    });
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id/sites")
  async getPerimeterSites(req: CustomRequest, res: Response) {
    const perimeterId = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireContributor();

    const perimeterSites = await perimeterManager.getSites(perimeter);
    
    res.send(classToPlain(perimeterSites));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id/products")
  async getPerimeterProducts(req: CustomRequest, res: Response) {
    const perimeterId = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const perimeter = await validatePerimeter(perimeterId, user!);
    
    await PerimeterAccessControl.buildFor(user, perimeter).requireContributor();

    const perimeterProducts = await perimeterManager.getProducts(perimeter);
    res.send(classToPlain(perimeterProducts));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id/entry-tags")
  async getPerimeterEntryTags(req: CustomRequest, res: Response) {
    const perimeterId = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireContributor();

    const perimeterEntryTags = await perimeterManager.getEntryTags(perimeter);
    res.send(classToPlain(perimeterEntryTags));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id/campaigns")
  async getPerimeterCampaigns(req: CustomRequest, res: Response) {
    const perimeterId = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const perimeter = await validatePerimeter(perimeterId, user!);

    const perimeterAccessControl =  PerimeterAccessControl.buildFor(user, perimeter)
    await perimeterAccessControl.requireContributor();
    const userRoleWithinPerimeter = await perimeterAccessControl.userRoleWithinPerimeter;

    const allPerimeterCampaigns = await perimeterManager.getCampaigns(perimeter);
    const allowedCampaigns = allPerimeterCampaigns.filter(campaign => {
      if (
        perimeterRoleManager.isGranted(
          { roles: [userRoleWithinPerimeter] },
          PERIMETER_ROLES.PERIMETER_MANAGER
        )
      ) {
        return true;
      }
      if (
        perimeterRoleManager.isGranted(
          { roles: [userRoleWithinPerimeter] },
          PERIMETER_ROLES.PERIMETER_COLLABORATOR
        )
      ) {
        return campaign.status !== CampaignStatus.IN_PREPARATION;
      }
      return (
        campaign.status !== CampaignStatus.IN_PREPARATION &&
        campaign.status !== CampaignStatus.CLOSED
      );
    })
    
    res.send(classToPlain(allowedCampaigns));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id/cartographySettings")
  async getPerimeterCartographySettings(req: CustomRequest, res: Response) {
    const perimeterId = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireContributor();

    const cartographySettings = await perimeterManager.getCartographySettings(
      perimeter
    );
    res.send(classToPlain(cartographySettings));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id/trajectory-settings")
  async getTrajectorySettings(req: CustomRequest, res: Response) {
    const perimeterId = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireContributor();

    const trajectorySettings = await perimeterManager.getTrajectorySettings(
      perimeter
    );
    res.send(classToPlain(trajectorySettings));
  }

  @use([
    only([ROLES.ROLE_MANAGER]),
    body("name").exists().isString(),
    body("description")
      .optional()
      .custom(value => typeOrNull("string", value)),
    expressValidatorThrower,
  ])
  @post("")
  async createPerimeter(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const perimeterInfo: { name: string; description?: string } = req.body;

    const perimeter = await perimeterManager.createNew(
      {
        company: user!.company,
        name: perimeterInfo.name,
        description: perimeterInfo.description,
      },
      true
    );
    await campaignManager.createNew(
      { 
        name: "Nouvelle campagne", 
        perimeter,
        type: CampaignType.CARBON_FOOTPRINT,
        year: (new Date()).getFullYear(), 
      },
      true
    );

    const analyticsPerimeter = new Analytics(`perimeter_created`);
    analyticsPerimeter.addAnalytic(user, undefined, perimeter);

    res.status(201).send(classToPlain(perimeter));
  }

  @use([
    param("id").exists().toInt(),
    body("name").exists().isString(),
    body("description").custom(value => typeOrNull("string", value)),
    expressValidatorThrower,
  ])
  @put("/:id")
  async updatePerimeter(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const perimeterId = req.params.id as unknown as number;
    const perimeterInfo: { name: string; description?: string } = req.body;
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireAdmin();

    const savedPerimeter = await perimeterManager.update(
      perimeter,
      perimeterInfo
    );

    res.status(200).send(classToPlain(savedPerimeter));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @del("/:id")
  async deletePerimeter(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const perimeterId = req.params.id as unknown as number;
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireAdmin();

    await perimeterManager.softDelete(perimeter);

    res.status(204).send();
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id/users")
  async getPerimeterUsers(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const perimeterId = req.params.id as unknown as number;
    const perimeter = await validatePerimeter(perimeterId, user!);

    await PerimeterAccessControl.buildFor(user, perimeter).requireContributor();

    const userRoleWithinPerimeter =
      await perimeterManager.getUserRoleWithinPerimeter(perimeter);

    const admins = await perimeterManager.getAdmins(perimeter);
    
    const users = userRoleWithinPerimeter.map(userRoleWithinPerimeter => {
      return {
        ...classToPlain(userRoleWithinPerimeter.user, {
          groups: ["user_with_profile"],
        }),
        roleWithinPerimeter: userRoleWithinPerimeter.role,
      };
    });
    res.send([...users, ...admins.map(admin => classToPlain(admin, {
      groups: ["user_with_profile"],
    }))]);
  }

  @use([
    param("id").exists().toInt(),
    body("email").isEmail().normalizeEmail(),
    body("firstName")
      .exists()
      .isLength({ min: 1 })
      .withMessage("First name must have min 1 characters"),
    body("lastName")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Last name must have min 1 characters"),
    body("role")
      .exists()
      .custom(value =>
        Object.values(ASSIGNABLE_PERIMETER_ROLE).includes(value)
      ),
    expressValidatorThrower,
  ])
  @post("/:id/users")
  async addUserInPerimeter(req: CustomRequest, res: Response) {
    const currentUser = await this.getUser(req, ["company"]);
    if (!currentUser) throw new Error("Undefined user");
    const locale = currentUser.locale ?? fallbackLocale;

    const perimeterId = req.params.id as unknown as number;
    const perimeter = await validatePerimeter(perimeterId, currentUser);

    await PerimeterAccessControl.buildFor(currentUser, perimeter).requireManager();

    const userData: {
      email: string;
      firstName: string;
      lastName: string;
      role: ASSIGNABLE_PERIMETER_ROLE;
    } = req.body;

    const formattedData = {
      email: userData.email,
      company: currentUser.company,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
      perimeter,
    };

    let user = await userManager.getByEmail({
      email: userData.email,
      withDeleted: true,
    });

    if (user == null) {
      user = await userManager.createNew(formattedData, true);
      await userManager.setResetPasswordToken(user, true);

      const mailResetPassword = Mail.buildDefault();

      // Les users du LEEM reçoivent un mail personalisé. Feature en urgence, d'où l'id en dur...
      const isLeemUser = currentUser.company.id === 83;
      const mailTemplate = isLeemUser ? "onboardLeem" : translations[locale].templateNames.onboard;
      const companyWelcome = isLeemUser ? "CarbonEM" : "WeCount";
      const fromName = isLeemUser ? "Responsabilité LEEM" : "WeCount";

      const subject = `${translations[locale].global.welcomeTo} ${companyWelcome} !`;

      ejs.renderFile(
        `templates/mail/auth/${mailTemplate}.ejs`,
        { url: `${baseFrontUrl}/set-password/${user.resetPasswordToken}` },
        {},
        async function (err, html) {
          await mailResetPassword
            .addTo(user!.email)
            .setSubject(subject)
            .setFromName(fromName)
            .setFromEmail("support@wecount.io")
            .setHtml(html)
            .send();
        }
      );
    }
    
    if (currentUser.company.id !== user.company.id) {
      throw new AccessDeniedError();
    }

    if(user.archived){
      await userManager.unarchive(user);
    }

    await perimeterManager.setUserRole(perimeter, user, userData.role);

    res.send({
      ...classToPlain(user, { groups: ["user_with_profile"] }),
      roleWithinPerimeter: userData.role,
    });
  }

  @use([
    param("id").exists().toInt(),
    body("userId").exists().toInt(),
    body("role")
      .exists()
      .custom(value =>
        Object.values(ASSIGNABLE_PERIMETER_ROLE).includes(value)
      ),
    expressValidatorThrower,
  ])
  @post("/:id/user-role")
  async updateUserRole(req: CustomRequest, res: Response) {
    const currentUser = await this.getUser(req, ["company"]);
    if (!currentUser) throw new Error("Undefined user");

    const perimeterId = req.params.id as unknown as number;
    const userToUpdateId = req.body.userId as unknown as number;
    const newRole = req.body.role as unknown as ASSIGNABLE_PERIMETER_ROLE;
    const perimeter = await validatePerimeter(perimeterId, currentUser);

    await PerimeterAccessControl.buildFor(currentUser, perimeter).requireManager();

    const userRoleWithinPerimeter =
      await perimeterManager.findUserRoleWithinPerimeter(
        perimeterId,
        userToUpdateId
      );
    if (userRoleWithinPerimeter == null) {
      throw new NotFoundError();
    }

    await perimeterManager.updateUserRole(userRoleWithinPerimeter, newRole);

    res.status(200).send();
  }

  
  @use(multipleSiteDataValidator)
  @post("/:id/import-sites")
  async insertMultipleSites(req: CustomRequest, res: Response) {
    const currentUser = await this.getUser(req, ["company"]);
    if (!currentUser) throw new Error("Undefined user");

    const perimeterId = req.params.id as unknown as number;

    const perimeter = await validatePerimeter(perimeterId, currentUser);

    await PerimeterAccessControl.buildFor(currentUser, perimeter).requireContributor();

    const sitesData = req.body as unknown as SiteData[];

    const newSites = await Promise.all(sitesData.filter(siteData => siteData.level === 1).map(async siteData => {
      const newSite = await siteManager.createNew({
        name: siteData.name,
        description: siteData.description,
        perimeter: perimeter,
        parentSiteId: null
      }, true);      

      return newSite;
    }));

    const newSubSites = await Promise.all(sitesData.filter(siteData => siteData.level === 2).map(async subSiteData => {
      const parentSite = await this.em.findOne(Site, {
        where: {
          name: subSiteData.parent
        }
      })

      const newSubSite = await siteManager.createNew({
        name: subSiteData.name,
        description: subSiteData.description,
        perimeter: perimeter,
        parentSiteId: parentSite === undefined ? null : parentSite.id
      }, true);
      return newSubSite;
    }));
    
    const perimeterSites = await perimeterManager.getSites(perimeter);
    
    res.send(classToPlain(perimeterSites));
  }
}

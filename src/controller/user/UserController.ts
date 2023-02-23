import { Request, Response } from "express";
import { get, controller, post, put, use, del } from "@deep/routing/decorators";
import { UserRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { body, param } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import only from '@service/core/security/auth/customAuthorizationMiddleware';
import { profileManager, userManager } from "@manager/index";
import { classToPlain } from 'class-transformer';
import Mail from "@root/service/core/mail/Mail";
import ejs from 'ejs';
import config from "config";
import { ROLES } from "@root/service/core/security/auth/config";
import { LOCALE } from "@root/entity/enum/Locale";
import { getManager } from "typeorm";
const baseFrontUrl: string = config.get('baseFrontUrl');

@controller("")
class CampaignController extends BaseController {
  @get("/user-full")
  async getFullCurrentUser(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, [
      "company",
      "profile",
      "roleWithinPerimeters"
    ]);

    res.send(
      classToPlain(user, {
        groups: [
          "user_with_profile",
          "user_with_company",
          "user_with_perimeter_roles",
        ],
      })
    );
  }

  @get("/user-list")
  async getCompanyUserList(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, [
      "company",
    ]);
    if (!user) throw new Error("Undefined user");

    const userRepository = this.em.getCustomRepository(UserRepository);
    const users = await userRepository.findUsersForCompany(user.company, true);

    res.send(classToPlain(users, {
      groups: ["user_with_profile"]
    }));
  }

  @use([
    only([ROLES.ROLE_MANAGER]),
    body("email").isEmail().normalizeEmail(),
    body("firstName")
      .exists()
      .isLength({ min: 1 })
      .withMessage("First name must have min 1 characters"),
    body("lastName")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Last name must have min 1 characters"),
    expressValidatorThrower,
  ])
  @post("/user-list")
  async createUser(req: CustomRequest, res: Response) {
    const currentUser = await this.getUser(req, [
      "company",
    ]);
    if (!currentUser) throw new Error("Undefined user");

    const userData: {
      email: string;
      firstName: string;
      lastName: string;
    } = req.body;

    const formattedData = {
      email: userData.email,
      company: currentUser.company,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
      perimeter: null,
    };

    const user = await userManager.createNew(formattedData, true);
    await userManager.setResetPasswordToken(user, true);

    const mailResetPassword = Mail.buildDefault();

    ejs.renderFile('templates/mail/auth/onboard.ejs', {
      url: `${baseFrontUrl}/set-password/${user.resetPasswordToken}`
    }, {}, async function(err, html) {
      await mailResetPassword
        .addTo(user.email)
        .setSubject('Bienvenue chez WeCount !')
        .setHtml(html)
        .send();
    });

    res.status(201).send(classToPlain(user, {
      groups: ["user_with_profile"]
    }));
  }

  @use([
    body("firstName")
      .exists()
      .isLength({ min: 1 })
      .withMessage("First name must have min 1 characters"),
    body("lastName")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Last name must have min 1 characters"),
    expressValidatorThrower,
  ])
  @put("/manager/user/:userId")
  async putUser(req: CustomRequest, res: Response) {
    const userId = (req.params.userId as unknown) as number;
    if (!userId) {
      throw new Error("");
    }
    
    const userRepository = this.em.getCustomRepository(UserRepository);
    const user = await userRepository.findOneOrFail(userId, {
      join: {
        alias: "u",
        leftJoinAndSelect: {
          profile: "u.profile",
        }
      }
    });

    const profileData: {
      firstName: string;
      lastName: string
    } = req.body;
    await profileManager.update(user.profile, profileData, true);

    res.status(200).send(classToPlain(user, {
      groups: ["user_with_profile"]
    }));
  }

  @post("/manager/user/:userId/archive")
  async archiveUser(req: CustomRequest, res: Response) {
    const userId = (req.params.userId as unknown) as number;
    if (!userId) {
      throw new Error("");
    }
    const userRepository = this.em.getCustomRepository(UserRepository);
    const user = await userRepository.findOneOrFail(userId);
    await userManager.archive(user);

    res.status(200).send({});
  }

  @post("/manager/user/:userId/unarchive")
  async unarchiveUser(req: CustomRequest, res: Response) {
    const userId = (req.params.userId as unknown) as number;
    if (!userId) {
      throw new Error("");
    }
    const userRepository = this.em.getCustomRepository(UserRepository);
    const user = await userRepository.findOneOrFail(userId);
    await userManager.unarchive(user);

    res.status(200).send({});
  }

  @use([
    body("locale").exists().custom((value) => Object.values(LOCALE).includes(value)),
    expressValidatorThrower,
  ])
  @put("/user/locale")
  async changeUserLocale(req: CustomRequest, res: Response) {
    const em = getManager();

    const user = await this.getUser(req);
    if (!user) {
      throw new Error("");
    }
    const { locale }: { locale: LOCALE } = req.body;

    user.locale = locale;
    await em.save(user);

    res.status(200).send({});
  }
}

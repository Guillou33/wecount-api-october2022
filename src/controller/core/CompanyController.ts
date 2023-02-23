import { Response } from "express";
import { get, controller, post, use, put } from "@deep/routing/decorators";
import { CompanyRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { query, param, body } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import only from '@service/core/security/auth/customAuthorizationMiddleware';
import { companyManager } from "@manager/index";
import { classToPlain } from 'class-transformer';
import config from "config";
import { ROLES } from "@root/service/core/security/auth/config";
import { Company } from "@root/entity";

@controller("/companies")
class CompanyController extends BaseController {
  @use([
    only([ROLES.ROLE_ADMIN]),
    query("offset").exists(),
    query("length").exists(),
    expressValidatorThrower,
  ])
  @get("/unlocked")
  async getUnlocked(req: CustomRequest, res: Response) {
    const {
      offset: rawOffset,
      length: rawLength,
    }: any = req.query;
    const offset = parseInt(rawOffset);
    const length = parseInt(rawLength);

    const companyRepository = this.em.getCustomRepository(CompanyRepository);
    const companies = await companyRepository.findWithUserPaginated({
      offset,
      length,
      locked: false
    });

    res.send(classToPlain(companies, {
      groups: ["company_with_users"]
    }));
  }

  @use([
    only([ROLES.ROLE_ADMIN]),
    query("offset").exists(),
    query("length").exists(),
    expressValidatorThrower,
  ])
  @get("/locked")
  async getLocked(req: CustomRequest, res: Response) {
    const {
      offset: rawOffset,
      length: rawLength,
    }: any = req.query;
    const offset = parseInt(rawOffset);
    const length = parseInt(rawLength);

    const companyRepository = this.em.getCustomRepository(CompanyRepository);
    const companies = await companyRepository.findWithUserPaginated({
      offset,
      length,
      locked: true
    });

    res.send(classToPlain(companies, {
      groups: ["company_with_users"]
    }));
  }

  @use([
    only([ROLES.ROLE_ADMIN]),
    param("id").exists().toInt(), expressValidatorThrower,
  ])
  @post("/:id/lock")
  async lock(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const company = await this.em.findOneOrFail(Company, {
      id
    });
    await companyManager.lock(company, true);

    res.status(200).send(classToPlain(company));
  }

  @use([
    only([ROLES.ROLE_ADMIN]),
    param("id").exists().toInt(), expressValidatorThrower,
  ])
  @post("/:id/unlock")
  async unlock(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const company = await this.em.findOneOrFail(Company, {
      id
    });
    await companyManager.unlock(company, true);

    res.status(200).send(classToPlain(company));
  }

  @use([
    only([ROLES.ROLE_ADMIN]),
    param("id").exists().toInt(),
    body("readonlyMode").exists().isBoolean(),
    expressValidatorThrower,
  ])
  @put("/:id/readonlyMode")
  async updateReadOnlyMode(req: CustomRequest, res: Response){
    const id = req.params.id as unknown as number;
    const { readonlyMode } = req.body as { readonlyMode: boolean };

    const company = await this.em.findOneOrFail(Company, {
      id,
    });

    await companyManager.setReadOnlyMode(company, readonlyMode, true);

    res.status(200).send(classToPlain(company));
  }

  @use([
    only([ROLES.ROLE_ADMIN]),
    query("name").exists(),
    expressValidatorThrower,
  ])
  @get("/unlocked/search")
  async searchUnlockedByName(req: CustomRequest, res: Response) {
    const companyRepository = this.em.getCustomRepository(CompanyRepository);
    const name = (req.query.name ?? "") as string;
    const companies = await companyRepository.findByName({ name });

    res.send(
      classToPlain(companies, {
        groups: ["company_with_users"],
      })
    );
  }

  @use([
    only([ROLES.ROLE_ADMIN]),
    query("name").exists(),
    expressValidatorThrower,
  ])
  @get("/locked/search")
  async searchLockedByName(req: CustomRequest, res: Response) {
    const companyRepository = this.em.getCustomRepository(CompanyRepository);
    const name = (req.query.name ?? "") as string;
    const companies = await companyRepository.findByName({ name, locked: true });

    res.send(
      classToPlain(companies, {
        groups: ["company_with_users"],
      })
    );
  }
}

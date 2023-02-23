import { Request, Response } from "express";
import { get, controller, post, put, use } from "@deep/routing/decorators";
import { SiteRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { body, param } from "express-validator";
import typeOrNull from "@service/utils/typeOrNull";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import {
  siteManager,
} from "@manager/index";
import { CsvExportResultRow } from "@repository/activity/ActivityEntryRepository";
import { classToPlain } from "class-transformer";
import { validateSite } from "./helpers/validateSite";
import { validatePerimeter } from "./helpers/validatePerimeter";
import { roleManager } from "@root/service/core/security/auth/RoleManager";
import { ROLES } from '@service/core/security/auth/config';
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";
import { Site } from "@root/entity";

type RowCsvColumns = keyof CsvExportResultRow;

@controller("/sites")
class SiteController extends BaseController {
  @get("")
  async getSites(req: CustomRequest, res: Response) {
    const user = await this.getUser(req);
    if (!user) throw new Error("Undefined user");

    const siteRepository = this.em.getCustomRepository(SiteRepository);
    
    let sites;
    if (roleManager.isGranted({ roles: user.getRoles() }, ROLES.ROLE_MANAGER)) {
      sites = await siteRepository.findAllForManager(user);
    } else {
      sites = await siteRepository.findAllForUser(user);
    }

    res.send(classToPlain(sites));
  }

  @use([
    body("name").isString(),
    body("description").optional().isString(),
    body("perimeterId").exists().toInt(),
    expressValidatorThrower,
  ])
  @post("")
  async postSite(req: Request, res: Response) {
    const user = await this.getUser(req, ["company"]);
    if (!user) throw new Error("Undefined user");
    const company = user.company;
    if (!company) throw new Error("Undefined company");

    const siteInfo: { name: string; description: string | null; perimeterId: number, parentSiteId: number | null } = req.body;
    const perimeter = await validatePerimeter(siteInfo.perimeterId, user);

    await PerimeterAccessControl.buildFor(user, perimeter).requireManager();

    const site = await siteManager.createNew({ ...siteInfo, perimeter }, true);

    res.status(201).send(classToPlain(site));
  }

  @use([
    body("name").exists().isString(),
    body("description").custom((value, { req }) => typeOrNull("string", value)),
    expressValidatorThrower,
  ])
  @put("/:id")
  async putSite(req: Request, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const site = await validateSite(id, user!);

    await PerimeterAccessControl.buildFor(user, site.perimeter).requireManager();

    const siteNewInfo: { name: string; description: string | null, parentSiteId: number | null } = req.body;
    await siteManager.update(site, siteNewInfo, true);

    res.status(200).send(classToPlain(site));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @post("/:id/archive")
  async archiveSite(req: Request, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const site = await validateSite(id, user!);

    await PerimeterAccessControl.buildFor(user, site.perimeter).requireManager();

    await siteManager.archive(site, true);

    res.status(200).send(classToPlain(site));
  }

  @use([
    body("listIds").exists().isArray(),
    expressValidatorThrower,
  ])
  @post("/archive/multiple")
  async archiveMultipleSites(req: Request, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const { listIds } = req.body;
  
    await siteManager.archiveMultiple(listIds, user!);
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @post("/:id/unarchive")
  async unarchiveSite(req: Request, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const site = await validateSite(id, user!);

    await PerimeterAccessControl.buildFor(user, site.perimeter).requireManager();

    await siteManager.unarchive(site, true);

    res.status(200).send(classToPlain(site));
  }
}

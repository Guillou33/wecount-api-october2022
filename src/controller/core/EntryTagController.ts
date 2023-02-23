import { Request, Response } from "express";
import { get, controller, post, put, use } from "@deep/routing/decorators";
import { EntryTagRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { body, param } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { entryTagManager } from "@manager/index";
import { classToPlain } from "class-transformer";
import { validateEntryTag } from "./helpers/validateEntryTag";
import { validatePerimeter } from "./helpers/validatePerimeter";
import { roleManager } from "@root/service/core/security/auth/RoleManager";
import { ROLES } from "@service/core/security/auth/config";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";

@controller("/entry-tags")
class EntryTagController extends BaseController {
  @get("")
  async getEntryTags(req: CustomRequest, res: Response) {
    const user = await this.getUser(req);
    if (!user) throw new Error("Undefined user");

    const entryTagRepositry = this.em.getCustomRepository(EntryTagRepository);

    let entryTags;
    if (roleManager.isGranted({ roles: user.getRoles() }, ROLES.ROLE_MANAGER)) {
      entryTags = await entryTagRepositry.findAllForManager(user);
    } else {
      entryTags = await entryTagRepositry.findAllForUser(user);
    }

    res.send(classToPlain(entryTags));
  }

  @use([
    body("name").isString(),
    body("perimeterId").exists().toInt(),
    expressValidatorThrower,
  ])
  @post("")
  async postEntryTag(req: Request, res: Response) {
    const user = await this.getUser(req, ["company"]);
    if (!user) throw new Error("Undefined user");
    const company = user.company;
    if (!company) throw new Error("Undefined company");

    const entryTagInfo: { name: string; perimeterId: number } = req.body;
    const perimeter = await validatePerimeter(entryTagInfo.perimeterId, user);

    await PerimeterAccessControl.buildFor(user, perimeter).requireManager();

    const entryTag = await entryTagManager.createNew(
      { ...entryTagInfo, perimeter },
      true
    );

    res.status(201).send(classToPlain(entryTag));
  }

  @use([body("name").exists().isString(), expressValidatorThrower])
  @put("/:id")
  async putEntryTag(req: Request, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const entryTag = await validateEntryTag(id, user!);

    await PerimeterAccessControl.buildFor(
      user,
      entryTag.perimeter
    ).requireManager();

    const entryTagNewInfo: { name: string } = req.body;
    await entryTagManager.update(entryTag, entryTagNewInfo, true);

    res.status(200).send(classToPlain(entryTag));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @post("/:id/archive")
  async archiveEntryTag(req: Request, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const entryTag = await validateEntryTag(id, user!);

    await PerimeterAccessControl.buildFor(
      user,
      entryTag.perimeter
    ).requireManager();

    await entryTagManager.archive(entryTag, true);

    res.status(200).send(classToPlain(entryTag));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @post("/:id/unarchive")
  async unarchiveEntryTag(req: Request, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const entryTag = await validateEntryTag(id, user!);

    await PerimeterAccessControl.buildFor(
      user,
      entryTag.perimeter
    ).requireManager();

    await entryTagManager.unarchive(entryTag, true);

    res.status(200).send(classToPlain(entryTag));
  }
}

import { Response } from "express";
import { get, controller, use, post, put } from "@deep/routing/decorators";
import { body, param, query } from "express-validator";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { CustomEmissionFactorRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { classToPlain } from "class-transformer";
import customEmissionFactorManager from "@root/manager/activity/customEmissionFactorManager";
import { CustomEmissionFactor, User } from "@root/entity";
import { roleManager } from "@root/service/core/security/auth/RoleManager";
import { ROLES } from "@root/service/core/security/auth/config";
import { validatePerimeter } from "../core/helpers/validatePerimeter";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";

@controller("/custom-emission-factor")
class CustomEmissionFactorController extends BaseController {
  @use([query("search").optional(), expressValidatorThrower])
  @get("")
  async getCustomEmissionFactor(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    if (!user) throw new Error("Undefined user");
    const userIsManager = roleManager.isGranted({ roles: user.getRoles() }, ROLES.ROLE_MANAGER);

    const search = req.query.search as string | undefined;
    
    const cefRepository = this.em.getCustomRepository(CustomEmissionFactorRepository);

    const cefs = await cefRepository.findAll({
      isManager: userIsManager,
      user,
      searchTerm: search,
    });

    const plainCEFs = classToPlain(cefs);

    res.send(plainCEFs);
  }

  @use([
    body("perimeterId").exists().toInt(),
    body("value").exists().toFloat(),
    body("name").exists().isString(),
    body("input1Name").exists().isString(),
    body("input1Unit").exists().isString(),
    body("source").optional(),
    body("comment").optional(),
    expressValidatorThrower,
  ])
  @post("")
  async createCustomEmissionFactor(req: CustomRequest, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const cefData: {
      perimeterId: number;
      value: number;
      name: string;
      input1Name: string;
      input1Unit: string;
      source?: string;
      comment?: string;
    } = req.body;
    const perimeter = await validatePerimeter(cefData.perimeterId, user!);
    await PerimeterAccessControl.buildFor(user, perimeter).requireManager();
    
    const cef = await customEmissionFactorManager.create({
      perimeter,
      ...cefData
    });
    const plainCEF = classToPlain(cef);

    res.status(201).send(plainCEF);
  }

  @use([
    body("value").exists().toFloat(),
    body("name").exists().isString(),
    body("input1Name").exists().isString(),
    body("input1Unit").exists().isString(),
    body("source").optional(),
    body("comment").optional(),
    expressValidatorThrower,
  ])
  @put("/:id")
  async updateCustomEmissionFactor(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    if (!user) {
      throw new Error("User not found");
    }
    const cefToUpdate = await this.validateCustomEmissionFactor(id, user);
    await PerimeterAccessControl.buildFor(user, cefToUpdate.perimeter).requireManager();

    const cefData: { 
      value: number;
      name: string;
      input1Name: string;
      input1Unit: string;
      source?: string;
      comment?: string;
    } = req.body;
    const cef = await customEmissionFactorManager.update(cefToUpdate, cefData);
    const plainCEF = classToPlain(cef);

    res.send(plainCEF);
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @post("/:id/archive")
  async archiveCustomEmissionFactor(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    if (!user) {
      throw new Error("User not found");
    }
    const cef = await this.validateCustomEmissionFactor(id, user);
    await PerimeterAccessControl.buildFor(user, cef.perimeter).requireManager();
    const updatedCef = await customEmissionFactorManager.archive(cef);
    res.send(classToPlain(updatedCef));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @post("/:id/unarchive")
  async unarchiveCustomEmissionFactor(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    if (!user) {
      throw new Error("User not found");
    }
    const cef = await this.validateCustomEmissionFactor(id, user);
    await PerimeterAccessControl.buildFor(user, cef.perimeter).requireManager();
    
    const updatedCef = await customEmissionFactorManager.unarchive(cef);
    res.send(classToPlain(updatedCef));
  }

  private async validateCustomEmissionFactor(cefId: number, user: User): Promise<CustomEmissionFactor> {
    const cefRepository = this.em.getCustomRepository(CustomEmissionFactorRepository);
    const cef = await cefRepository.findOneOrFail(cefId, {
      join: {
        alias: "c",
        innerJoinAndSelect: {
          perimeter: "c.perimeter",
          company: "perimeter.company",
        },
      }
    });
    if (cef.perimeter.company.id !== user.company.id) {
      throw new Error("Custom Emission Factor is not from correct company");
    }

    return cef;
  }
}

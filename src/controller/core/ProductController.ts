import { Request, Response } from "express";
import { get, controller, post, put, use } from "@deep/routing/decorators";
import { ProductRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { body, param } from "express-validator";
import typeOrNull from "@service/utils/typeOrNull";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import {
  productManager,
} from "@manager/index";
import { CsvExportResultRow } from "@repository/activity/ActivityEntryRepository";
import { classToPlain } from "class-transformer";
import { validateProduct } from "./helpers/validateProduct";
import { validatePerimeter } from "./helpers/validatePerimeter";
import { roleManager } from "@root/service/core/security/auth/RoleManager";
import { ROLES } from '@service/core/security/auth/config';
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";

type RowCsvColumns = keyof CsvExportResultRow;

@controller("/products")
class ProductController extends BaseController {
  @get("")
  async getProducts(req: CustomRequest, res: Response) {
    const user = await this.getUser(req);
    if (!user) throw new Error("Undefined user");

    const productRepository = this.em.getCustomRepository(ProductRepository);
    
    let products;
    if (roleManager.isGranted({ roles: user.getRoles() }, ROLES.ROLE_MANAGER)) {
      products = await productRepository.findAllForManager(user);
    } else {
      products = await productRepository.findAllForUser(user);
    }

    res.send(classToPlain(products));
  }

  @use([
    body("name").isString(),
    body("description").custom((value, { req }) => typeOrNull("string", value)),
    body("quantity").custom((value, { req }) => typeOrNull("number", value)),
    body("perimeterId").exists().toInt(),
    expressValidatorThrower,
  ])
  @post("")
  async postProduct(req: Request, res: Response) {
    const user = await this.getUser(req, ["company"]);
    if (!user) throw new Error("Undefined user");
    const company = user.company;
    if (!company) throw new Error("Undefined company");

    const productInfo: { name: string; description: string | null; quantity: number | null; perimeterId: number } = req.body;
    const perimeter = await validatePerimeter(productInfo.perimeterId, user);

    await PerimeterAccessControl.buildFor(user, perimeter).requireManager();

    const product = await productManager.createNew({ ...productInfo, perimeter }, true);

    res.status(201).send(classToPlain(product));
  }

  @use([
    param("id").exists().toInt(),
    body("name").exists().isString(),
    body("description").custom((value, { req }) => typeOrNull("string", value)),
    body("quantity").custom((value, { req }) => typeOrNull("number", value)),
    expressValidatorThrower,
  ])
  @put("/:id")
  async putProduct(req: Request, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const product = await validateProduct(id, user!);

    await PerimeterAccessControl.buildFor(user, product.perimeter).requireManager();

    const productNewInfo: { name: string; description: string | null; quantity: number | null; } = req.body;
    await productManager.update(product, productNewInfo, true);

    res.status(200).send(classToPlain(product));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @post("/:id/archive")
  async archiveProduct(req: Request, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const product = await validateProduct(id, user!);

    await PerimeterAccessControl.buildFor(user, product.perimeter).requireManager();

    await productManager.archive(product, true);

    res.status(200).send(classToPlain(product));
  }

  @use([
    body("listIds").exists().isArray(),
    expressValidatorThrower,
  ])
  @post("/archive/multiple")
  async archiveMultipleProducts(req: Request, res: Response) {
    const user = await this.getUser(req, ["company"]);
    const { listIds } = req.body;
  
    await productManager.archiveMultiple(listIds, user!);
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @post("/:id/unarchive")
  async unarchiveProduct(req: Request, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const product = await validateProduct(id, user!);

    await PerimeterAccessControl.buildFor(user, product.perimeter).requireManager();

    await productManager.unarchive(product, true);

    res.status(200).send(classToPlain(product));
  }
}

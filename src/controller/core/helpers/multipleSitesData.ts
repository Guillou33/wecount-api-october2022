import expressValidatorThrower from "@root/service/core/error/middleware/expressValidatorThrower";
import typeOrNull from "@root/service/utils/typeOrNull";
import { body, param } from "express-validator";

export type SubSiteData = {
    name: string;
    description: string | null;
    archivedDate: string | null;
}

export type SiteData = {
    name: string;
    description: string | null;
    archivedDate: string | null;
    parent: string | null;
    level: number;
    subSites: SubSiteData[];
}

export const multipleSubSiteDataValidator = [
    body("*.name")
        .exists()
        .custom(value => typeOrNull("string", value)),
    body("*.description")
        .exists()
        .custom(value => typeOrNull("string", value)),
    body("*.archivedDate").exists().isDate(),
    expressValidatorThrower,
]

export const multipleSiteDataValidator = [
    param("id").exists().toInt(),
    body("*.name")
        .exists()
        .custom(value => typeOrNull("string", value)),
    body("*.description")
        .exists()
        .custom(value => typeOrNull("string", value)),
    body("*.archivedDate")
        .exists()
        .custom(value => typeOrNull("string", value)),
    body("*.parent")
        .exists()
        .custom(value => typeOrNull("string", value)),
    body("*.level")
        .exists()
        .custom(value => typeOrNull("number", value)),
    body("*.subSites")
        .exists()
        .isArray(),
        // .custom(value => arrayOfCustomType(() => , value)),
    expressValidatorThrower,
]
import { body, param } from "express-validator";

import arrayOfType from "@service/utils/arrayOfType";
import typeOrNull from "@service/utils/typeOrNull";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";

import { ComputeMethodType } from "@root/entity/enum/ComputeMethodType";

export type EntryData = {
  activityModelId: number;
  siteId: number | null;
  productId: number | null;
  ownerId: number | null;
  writerId: number | null;
  computeMethodType: ComputeMethodType;
  computeMethodId: number | null;
  emissionFactorId: number | null;
  customEmissionFactorId: number | null;
  value: number | null;
  value2: number | null;
  description: string | null;
  dataSource: string | null;
  manualTco2: number | null;
  manualUnitNumber: number | null;
  uncertainty: number;
  tags: number[];
  instruction: string | null;
  metadata: {
    fileName: string;
    importDate: string;
  }
};

export const multipleEntryDataValidator = [
  param("id").exists().toInt(),
  body("*.activityModelId").exists().isInt(),
  body("*.siteId")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.productId")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.ownerId")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.writerId")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.writerId")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.computeMethodType")
    .exists()
    .custom(value => Object.values(ComputeMethodType).includes(value)),
  body("*.computeMethodId")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.emissionFactorId")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.value")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.value2")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.description")
    .exists()
    .custom(value => typeOrNull("string", value)),
  body("*.dataSource")
    .exists()
    .custom(value => typeOrNull("string", value)),
  body("*.manualTco2")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.manualUnitNumber")
    .exists()
    .custom(value => typeOrNull("number", value)),
  body("*.uncertainty").exists().toFloat(),
  body("*.tags")
    .exists()
    .custom(value => arrayOfType("number", value)),
  body("*.instruction")
    .exists()
    .custom(value => typeOrNull("string", value)),
  body("*.metadata").optional(),
  body("*.metadata.fileName").optional().isString(),
  body("*.metadata.importTimestamp").optional().isInt(),
  body("*.customEmissionFactorId")
    .optional()
    .custom(value => typeOrNull("number", value)),
  expressValidatorThrower,
];

import { ComputeMethodType } from "@root/entity/enum/ComputeMethodType";

export const validData = {
  activityModelId: 1,
  siteId: 445,
  productId: null,
  ownerId: null,
  writerId: null,
  computeMethodType: ComputeMethodType.STANDARD,
  computeMethodId: 1,
  emissionFactorId: 1,
  value: 10000,
  value2: null,
  description: "coucou",
  dataSource: null,
  uncertainty: 0,
  tags: [1, 2],
  manualTco2: null,
  manualUnitNumber: null,
  instruction: null,
};

export const validData2 = {
  ...validData,
  computeMethodType: ComputeMethodType.RAW_DATA,
  manualTco2: 1250,
};

export const validData3 = (cefId: number) => ({
  ...validData,
  emissionFatorId: null,
  computeMethodType: ComputeMethodType.CUSTOM_EMISSION_FACTOR,
  customEmissionFactorId: cefId
});

export const invalidDataList: ([string, any])[] = [
  ["activityModelId", { ...validData, activityModelId: null }],
  ["siteId", { ...validData, siteId: "bad" }],
  ["productId", { ...validData, productId: "bad" }],
  ["ownerId", { ...validData, ownerId: "bad" }],
  ["writerId", { ...validData, writerId: "bad" }],
  ["computeMethodType", { ...validData, computeMethodType: "bad" }],
  ["computeMethodId", { ...validData, computeMethodId: "bad" }],
  ["emissionFactorId", { ...validData, emissionFactorId: "bad" }],
  ["value", { ...validData, value: "bad" }],
  ["value2", { ...validData, value2: "bad" }],
  ["description", { ...validData, description: 42 }],
  ["dataSource", { ...validData, dataSource: 42 }],
  ["tags", { ...validData, tags: 42 }],
  ["manualTco2", { ...validData, manualTco2: "bad" }],
  ["manualUnitNumber", { ...validData, manualUnitNumber: "bad" }],
  ["instruction", { ...validData, instruction: 42 }],
];

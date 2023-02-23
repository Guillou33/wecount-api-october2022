import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";
import { getCustomRepository, getManager } from "typeorm";
import { ComputeMethodRepository, EmissionFactorMappingRepository } from "@root/repository";
import { testString } from "@root/service/utils/tokenGenerator";
import { ComputeMethod, Content } from "@root/entity";
import { LOCALE } from "@root/entity/enum/Locale";

it("Can't autocomplete EF if not logged in", async () => {
  await request(app)
    .get("/compute-method/1/emission-factor/autocomplete?search=test")
    .send()
    .expect(403);
});

it("Can autocomplete EF", async () => {
  const em = getManager();

  const cm = await getCustomRepository(ComputeMethodRepository).findOneOrFail({
    join: {
      alias: "cm",
      innerJoinAndSelect: {
        emissionFactorTagLabelMappings: "cm.emissionFactorTagLabelMappings",
        emissionFactorTagLabel: "emissionFactorTagLabelMappings.emissionFactorTagLabel",
        emissionFactorMappings: "emissionFactorTagLabel.emissionFactorMappings",
        emissionFactor: "emissionFactorMappings.emissionFactor",
      },
    }
  });
  const contentEfNameFr = await em.getRepository(Content).findOneOrFail({
    where: {
      code: cm.emissionFactorTagLabelMappings[0].emissionFactorTagLabel.emissionFactorMappings[0].emissionFactor.nameContentCode,
      locale: LOCALE.FR_FR,
    }
  });


  const autocompleteResponse = await request(app)
    .get(`/compute-method/${cm.id}/emission-factor/autocomplete?search=${contentEfNameFr.text}`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send()
    .expect(200);

  expect(Array.isArray(autocompleteResponse.body)).toBeTruthy();
  expect(autocompleteResponse.body.length).toBeTruthy();
});

it("Gives nothing on dummy autocomplete", async () => {
  const em = getManager();

  const cm = await getCustomRepository(ComputeMethodRepository).findOneOrFail({
    join: {
      alias: "cm",
      innerJoinAndSelect: {
        emissionFactorTagLabelMappings: "cm.emissionFactorTagLabelMappings",
        emissionFactorTagLabel: "emissionFactorTagLabelMappings.emissionFactorTagLabel",
        emissionFactorMappings: "emissionFactorTagLabel.emissionFactorMappings",
        emissionFactor: "emissionFactorMappings.emissionFactor",
      },
    }
  });

  const autocompleteResponse = await request(app)
    .get(`/compute-method/${cm.id}/emission-factor/autocomplete?search=${testString(30)}`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send()
    .expect(200);

  expect(Array.isArray(autocompleteResponse.body)).toBeTruthy();
  expect(autocompleteResponse.body.length).toBeFalsy();
});

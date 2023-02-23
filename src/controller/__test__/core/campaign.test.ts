import request from "supertest";
import { app } from "@root/app";
import { testString } from '@service/utils/tokenGenerator';
import { getManager } from 'typeorm';
import { Campaign, CustomEmissionFactor } from "@entity/index";
import { getJwtUser } from "@root/test/utils/utils";
import { weepulseAdmin, theAdmin } from "@root/test/mock/users";
import { CampaignType } from "@root/entity/enum/CampaignType";
import { CampaignStatus } from "@root/entity/enum/CampaignStatus";
import { campaignNextStatusAuthorization } from "@root/manager/core/campaignManager";
import {
  validData,
  validData2,
  validData3,
  invalidDataList,
} from "@root/test/utils/multipleEntriesTestData";
import { createCEF } from "../activity/customEmissionFactor.test";

let campaignYear = 2030;
export const getUniqueTestCampaignYear = () => {
  return campaignYear++;
}

export async function createTestCampaign(){
  const perimeterId = 1;
  const name = testString();
  await request(app)
    .post("/campaigns")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      campaignTemplateId: 1,
      name,
      description: testString(),
      perimeterId,
      year: getUniqueTestCampaignYear(),
      type: CampaignType.SIMULATION,
    });


  const res = await request(app)
    .get("/campaigns")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  const campaignId = res.body[0].id;
  return { campaignId };
}

it("Can't get campaigns if not logged in", async () => {
  await request(app)
    .get("/campaigns")
    .send()
    .expect(403);
});

it("Can get campaigns", async () => {
  await request(app)
    .get("/campaigns")
    .set('Authorization', `Bearer ${getJwtUser()}`)
    .send()
    .expect(200);
});

it("Can create a campaign", async () => {
  const perimeterId = 5;
  const name = testString();
  await request(app)
    .post("/campaigns")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      campaignTemplateId: 4,
      name,
      description: testString(),
      perimeterId,
      year: getUniqueTestCampaignYear(),
      type: CampaignType.SIMULATION,
    })
    .expect(201);

  const em = getManager();
  const campaign = await em.findOne(Campaign, {
    name
  }, { 
    order: { createdAt: "DESC" } 
  });

  expect(campaign).toBeTruthy();
});

it("Can get a campaign", async () => {
  const em = getManager();
  const campaign = await em.findOne(Campaign, { order: { createdAt: "DESC" } });

  expect(campaign).toBeTruthy();
  if (!campaign) {
    throw new Error("Can't create a campaign before update");
  } 
  const campaignId = campaign.id;

  await request(app)
    .get(`/campaigns/${campaignId}`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);
});

it("Can update a campaign", async () => {
  const em = getManager();
  const campaign = await em.findOne(Campaign, { 
    where: {
      id: 1,
    },
    order: { createdAt: "DESC" } 
  });

  expect(campaign).toBeTruthy();
  if (!campaign) {
    throw new Error("Can't create a campaign before update");
  } 
  const campaignId = campaign.id;

  const newName = 'modified_' + testString();
  const newDescription = 'modified_' + testString();
  await request(app)
    .put(`/campaigns/${campaignId}`)
    .set('Authorization', `Bearer ${getJwtUser(theAdmin)}`)
    .send({
      name: newName,
      description: newDescription,
      year: getUniqueTestCampaignYear(),
      targetYear: 2022,
      status: campaign.status,
      type: CampaignType.CARBON_FOOTPRINT,
    })
    .expect(200);

  const campaignUpdated = await em.findOne(Campaign, campaignId);
  if (!campaignUpdated) {
    throw new Error("Campaign has no name");
  } 

  expect(campaignUpdated.name).toBe(newName);
  expect(campaignUpdated.description).toBe(newDescription);
});

it("Can delete a campaign", async () => {
  const em = getManager();
  const campaign = await em.findOne(Campaign, { order: { createdAt: "DESC" } });

  expect(campaign).toBeTruthy();
  if (!campaign) {
    throw new Error("Can't create a campaign before update");
  } 
  const campaignId = campaign.id;

  await request(app)
    .del(`/campaigns/${campaignId}`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(204);

  await request(app)
    .get(`/campaigns/${campaignId}`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(404);
});

it("Can create multiple entries in campaign", async () => {
  const {campaignId} = await createTestCampaign();

  await createCEF();
  const em = getManager();
  const cef = await em.findOne(CustomEmissionFactor, { order: { createdAt: "DESC" } });
  expect(cef).toBeTruthy();
  if (!cef) {
    throw new Error("No CustomEmissionFactor in db");
  }

  await request(app)
    .post(`/campaigns/${campaignId}/entries/create-multiple`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send([validData, validData2, validData3(cef.id)])
    .expect(201);
})

it.each(invalidDataList)(
  "Denies malformed requests on %s to multiple entries",
  async (_, invalidData) => {
    const { campaignId } = await createTestCampaign();

    await request(app)
      .post(`/campaigns/${campaignId}/entries/create-multiple`)
      .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
      .send([invalidData])
      .expect(400);
  }
);

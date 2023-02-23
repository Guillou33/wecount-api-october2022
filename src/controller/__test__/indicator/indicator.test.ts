import request from "supertest";
import { app } from "@root/app";
import { testString } from "@service/utils/tokenGenerator";
import { getJwtUser } from "@root/test/utils/utils";
import { weepulseAdmin } from "@root/test/mock/users";
import { CampaignType } from "@root/entity/enum/CampaignType";
import { getUniqueTestCampaignYear } from "../core/campaign.test";

async function getTestCampaign() {
  const perimeterId = 5;
  const campaignTemplateId = 4;

  const res = await request(app)
    .post("/campaigns")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      campaignTemplateId,
      name: testString(),
      description: testString(),
      perimeterId,
      year: getUniqueTestCampaignYear(),
      type: CampaignType.SIMULATION,
    });
  
  return res.body;
}

async function getTestIndicator() {
  const campaign = await getTestCampaign();

  const res = await request(app)
    .post("/indicators")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      campaignId: campaign.id,
      name: testString(),
      quantity: 42,
    });

  return res.body;
}

it("can create an indicator", async () => {
  const testCampaign = await getTestCampaign();

  request(app)
    .post("/indicators")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      campaignId: testCampaign.id,
      name: testString(),
    })
    .expect(200);
});

it("can get an indicator", async () => {
  const testIndicator = await getTestIndicator();

  const res = await request(app)
    .get("/indicators/" + testIndicator.id)
    .set("Authorization", `Bearer ${getJwtUser()}`);

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({
    id: testIndicator.id,
    quantity: 42,
  });
});

it("can delete an indicator", async () => {
  const testIndicator = await getTestIndicator();

  await request(app)
    .delete("/indicators/" + testIndicator.id)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(204);

  await request(app)
    .get("/indicators/" + testIndicator.id)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(404);
});

it("cannot create an indicator without a name", async () => {
  const testCampaign = await await getTestCampaign();

  request(app)
    .post("/indicators")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      campaignId: testCampaign.id,
    })
    .expect(400);
});

it("can update an indicator", async () => {
  const testIndicator = await getTestIndicator();

  await request(app)
    .put("/indicators/" + testIndicator.id)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      name: "updated name",
      quantity: 105,
      unit: "updated unit",
    })
    .expect(200);

  const res = await request(app)
    .get("/indicators/" + testIndicator.id)
    .set("Authorization", `Bearer ${getJwtUser()}`);

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({
    id: testIndicator.id,
    name: "updated name",
    quantity: 105,
    unit: "updated unit",
  });
});

it("can update an indicator with null values", async () => {
  const testIndicator = await getTestIndicator();

  await request(app)
    .put("/indicators/" + testIndicator.id)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      name: "updated name",
      quantity: null,
      unit: null,
    })
    .expect(200);

  const res = await request(app)
    .get("/indicators/" + testIndicator.id)
    .set("Authorization", `Bearer ${getJwtUser()}`);

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({
    id: testIndicator.id,
    name: "updated name",
    quantity: null,
    unit: null,
  });
});

it("cannot update an indicator without a name", async () => {
  const testIndicator = await getTestIndicator();

  await request(app)
    .put("/indicators/" + testIndicator.id)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      name: null,
      quantity: "45",
      unit: "test",
    })
    .expect(400);

});

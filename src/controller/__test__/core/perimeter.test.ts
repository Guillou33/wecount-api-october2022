import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";
import { testString } from "@service/utils/tokenGenerator";
import { weepulseAdmin } from "@root/test/mock/users";
import { CampaignType } from "@root/entity/enum/CampaignType";
import { getUniqueTestCampaignYear } from "./campaign.test";

export async function getTestPerimeter(): Promise<number> {
  const res = await request(app)
    .post("/perimeters/")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testString(),
    });

  return Number(res.body.id);
}

async function getTestSite(name: string, perimeterId: number) {
  const res = await request(app)
    .post("/sites")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name,
      perimeterId,
      parentSiteId: null,
    });
  return Number(res.body.id);
}

async function getTestProduct(name: string, perimeterId: number) {
  const res = await request(app)
    .post("/products")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name,
      perimeterId,
      quantity: 0,
      description: "",
    });
  return Number(res.body.id);
}

async function getTestCampaign(name: string, perimeterId: number, campaignTemplateId: number) {
  const res = await request(app)
    .post("/campaigns")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name,
      perimeterId,
      year: getUniqueTestCampaignYear(),
      type: CampaignType.CARBON_FOOTPRINT,
      campaignTemplateId,
    });
  return Number(res.body.id);
}

it("Can create a perimeter", async () => {
  const name = testString();

  const creationResult = await request(app)
    .post("/perimeters")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({ name })
    .expect(201);

  const res = await request(app)
    .get("/perimeters/" + creationResult.body.id)
    .set(
      "Authorization",
      `Bearer ${getJwtUser(weepulseAdmin)}`
    );

  expect(res.status).toBe(200);
  expect(res.body.name).toBe(name);
});

it("Can get all perimeters sub ressources", async () => {
  const perimeterId = 1;
  const campaignPerimeterId = 5;

  await getTestSite("site1", perimeterId);
  await getTestSite("site2", perimeterId);

  await getTestProduct("product1", perimeterId);

  await getTestCampaign("campaign1", campaignPerimeterId, 4);

  const sitesRequest = request(app)
    .get(`/perimeters/${perimeterId}/sites`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .expect(200);

  const productsRequest = request(app)
    .get(`/perimeters/${perimeterId}/products`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .expect(200);

  const campaignsRequest = request(app)
    .get(`/perimeters/${campaignPerimeterId}/campaigns`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .expect(200);

  const cartographySettingsrequest = request(app)
    .get(`/perimeters/${perimeterId}/cartographySettings`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(200);

  const [sitesRes, productsRes, campaignsRes, cartographyRes] =
    await Promise.all([
      sitesRequest,
      productsRequest,
      campaignsRequest,
      cartographySettingsrequest,
    ]);

  expect(sitesRes.body.some((site: any) => site.name === "site1")).toBe(true);
  expect(sitesRes.body.some((site: any) => site.name === "site2")).toBe(true);

  expect(productsRes.body.some((p: any) => p.name === "product1")).toBe(true);

  expect(campaignsRes.body.some((c: any) => c.name === "campaign1")).toBe(true);

  expect(cartographyRes.body.categorySettings).toBeTruthy();
  expect(cartographyRes.body.visibleActivityModels).toBeTruthy();
});

it("Can delete a perimeter", async () => {
  const perimeterId = await getTestPerimeter();

  await request(app)
    .delete("/perimeters/" + perimeterId)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .expect(204);

  await request(app)
    .get("/perimeters/" + perimeterId)
    .set(
      "Authorization",
      `Bearer ${getJwtUser(weepulseAdmin)}`
    )
    .expect(404);
});

it("Can update a perimeter", async () => {
  const perimeterId = await getTestPerimeter();

  await request(app)
    .put("/perimeters/" + perimeterId)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: "updated perimeter name",
      description: "updated perimeter description",
    })
    .expect(200);

  const res = await request(app)
    .get("/perimeters/" + perimeterId)
    .set(
      "Authorization",
      `Bearer ${getJwtUser(weepulseAdmin)}`
    )
    .expect(200);

  expect(res.body.name).toBe("updated perimeter name");
  expect(res.body.description).toBe("updated perimeter description");
});

it("Can get the user list", async () => {
  const perimeterId = await getTestPerimeter();

  await request(app)
    .get(`/perimeters/${perimeterId}/users`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .expect(200);
});

it("Denies a malformed update request", async () => {
  const perimeterId = await getTestPerimeter();

  await request(app)
    .put("/perimeters/" + perimeterId)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      name: "try updating",
    })
    .expect(400);
});

it("Can get the perimeter list", async () => {
  await request(app)
    .get("/perimeters")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(200);
});

it("Can assign a role to a user ", async () => {
  const perimeterId = await getTestPerimeter();

  const userResponse = await request(app)
    .post(`/perimeters/${perimeterId}/users`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      email: "test-new-user@test.com",
      firstName: "testSurname",
      lastName: "testName",
      role: "PERIMETER_CONTRIBUTOR",
    })
    .expect(200);

  const res = await request(app)
    .get(`/perimeters/${perimeterId}/users`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .expect(200);

  expect(
    res.body.some(
      (user: any) =>
        user.id === userResponse.body.id &&
        user.roleWithinPerimeter === "PERIMETER_CONTRIBUTOR"
    )
  );
});

it("Can update a user role", async () => {
  const perimeterId = await getTestPerimeter();

  const userResponse = await request(app)
    .post(`/perimeters/${perimeterId}/users`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      email: "test-new-user@test.com",
      firstName: "testSurname",
      lastName: "testName",
      role: "PERIMETER_CONTRIBUTOR",
    })
    .expect(200);

  await request(app)
    .post(`/perimeters/${perimeterId}/user-role`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      userId: userResponse.body.id,
      role: "PERIMETER_MANAGER",
    })
    .expect(200);

  const res = await request(app)
    .get(`/perimeters/${perimeterId}/users`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .expect(200);

  expect(
    res.body.some(
      (user: any) =>
        user.id === userResponse.body.id &&
        user.roleWithinPerimeter === "PERIMETER_MANAGER"
    )
  );
});

it("Denies malformed user roles assignment request", async () => {
  const perimeterId = await getTestPerimeter();
  await request(app)
    .post(`/perimeters/${perimeterId}/users`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      email: "test-new-user@test.com",
      firstName: "testSurname",
      lastName: "testName",
      role: "bad",
    })
    .expect(400);

  await request(app)
    .post(`/perimeters/${perimeterId}/users`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      email: "bad",
      firstName: "testSurname",
      lastName: "testName",
      role: "PERIMETER_CONTRIBUTOR",
    })
    .expect(400);

  await request(app)
    .post(`/perimeters/${perimeterId}/users`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      email: "test-new-user@test.com",
      firstName: "",
      lastName: "testName",
      role: "PERIMETER_CONTRIBUTOR",
    })
    .expect(400);

  await request(app)
    .post(`/perimeters/${perimeterId}/users`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      email: "test-new-user@test.com",
      firstName: "testSurname",
      lastName: "",
      role: "PERIMETER_CONTRIBUTOR",
    })
    .expect(400);
});

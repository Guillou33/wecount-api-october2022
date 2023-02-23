import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  theAdmin,
  userTwo,
  userFour,
  userManager,
  userCollaborator,
  weepulseAdmin,
} from "@root/test/mock/users";
import { CampaignType } from "@root/entity/enum/CampaignType";
import { getUniqueTestCampaignYear } from "@root/controller/__test__/core/campaign.test";

describe("Read campaigns", () => {
  it.each([
    ["an admin", theAdmin, [1, 2, 3]],
    ["a user in 1 perimeter", userTwo, [1]],
    ["a user in 2 perimeters", userFour, [1, 2]],
  ])("Fetches the correct campaigns for a %s", async (_, user, expected) => {
    const res = await request(app)
      .get(`/campaigns`)
      .set("Authorization", `Bearer ${getJwtUser(user)}`);

    expect(res.status).toBe(200);
    expect(res.body.map((ressource: any) => ressource.id).sort()).toEqual(
      expected
    );
  });

  it.each([
    ["an admin", theAdmin, [2]],
    ["a user", userFour, [2]],
  ])(
    "Fetches the correct campaigns in a given perimeter for %s",
    async (_, user, expected) => {
      const res = await request(app)
        .get(`/perimeters/3/campaigns`)
        .set("Authorization", `Bearer ${getJwtUser(user)}`);

      expect(res.status).toBe(200);
      expect(res.body.map((ressource: any) => ressource.id).sort()).toEqual(
        expected
      );
    }
  );

  it.each([
    ["perimeter", userFour],
    ["company", weepulseAdmin],
  ])("Denies access to a campaign out of %s", async (_, user) => {
    await request(app)
      .get("/campaigns/3")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  });

  it.each([
    ["assignment", userFour],
    ["user company", weepulseAdmin],
  ])(
    "Denies access campaigns in a given perimeter for a user out of %s",
    async (_, user) => {
      await request(app)
        .get("/perimeters/4/campaigns")
        .set("Authorization", `Bearer ${getJwtUser(user)}`)
        .expect(403);
    }
  );

  it.each([
    ["in perimeter assignment", userFour],
    ["as perimeter admin", theAdmin],
  ])("Allows access to a campaign %s", async (_, user) => {
    await request(app)
      .get("/campaigns/2")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(200);
  });
});

describe("Write campaigns", () => {
  it.each([
    ["contributor", userFour],
    ["collaborator", userCollaborator],
  ])("Denies campaigns creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        perimeterId: 3,
        campaignTemplateId: 2,
        name: "new-campaign",
        year: getUniqueTestCampaignYear(),
        type: CampaignType.SIMULATION,
      })
      .expect(403);
  });

  it.each([
    ["admin", theAdmin],
    ["manager", userManager],
  ])("Allows campaigns creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        perimeterId: 3,
        campaignTemplateId: 2,
        name: "new-campaign",
        year: getUniqueTestCampaignYear(),
        type: CampaignType.SIMULATION,
      })
      .expect(201);
  });
});

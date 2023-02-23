import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  theAdmin,
  userFour,
  userManager,
  userCollaborator,
  weepulseAdmin,
} from "@root/test/mock/users";
import { getUniqueTestCampaignYear } from "@root/controller/__test__/core/campaign.test";
import { getManager } from "typeorm";
import { Campaign } from "@root/entity";
import { campaignNextStatusAuthorization } from "@root/manager/core/campaignManager";
import { CampaignType } from "@root/entity/enum/CampaignType";

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
])("Denies campaigns update by a %s", async (_, user) => {
  const em = getManager();
  const campaign = await em.findOne(Campaign, { 
    where: {
      id: 2,
    },
  });
  expect(campaign).toBeTruthy();
  if (!campaign) {
    throw new Error("Campaign of id 2 should exist");
  }
  await request(app)
    .put("/campaigns/2")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      name: "updated-site",
      description: "updated-description",
      targetYear: 0,
      year: getUniqueTestCampaignYear(),
      status: campaignNextStatusAuthorization[campaign.status][0],
      type: CampaignType.CARBON_FOOTPRINT,
    })
    .expect(403);
});

it.each([
  ["perimeter admin", theAdmin],
  ["perimeter manager", userManager],
])("Allows campaigns update by a %s", async (_, user) => {
  const em = getManager();
  const campaign = await em.findOne(Campaign, { 
    where: {
      id: 2,
    },
  });
  expect(campaign).toBeTruthy();
  if (!campaign) {
    throw new Error("Campaign of id 2 should exist");
  } 

  // Generate 2 increments
  getUniqueTestCampaignYear();
  const year = getUniqueTestCampaignYear();
  await request(app)
    .put("/campaigns/2")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      name: "updated-site",
      description: "updated-description",
      targetYear: 0,
      year,
      status: campaignNextStatusAuthorization[campaign.status][0],
      type: CampaignType.CARBON_FOOTPRINT,
    })
    .expect(200);
});

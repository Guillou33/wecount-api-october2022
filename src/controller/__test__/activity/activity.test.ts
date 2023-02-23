import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";

import { createActivityEntry } from "./activityEntry.test";
import { weepulseAdmin } from "@root/test/mock/users";

export const getLastActivity = async (campaignId: number) => {
  const activitiesRes = await request(app)
    .get(`/campaigns/${campaignId}/activities`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send()
    .expect(200);

  expect(Array.isArray(activitiesRes.body)).toBeTruthy();
  expect(activitiesRes.body.length).toBeGreaterThanOrEqual(1);

  return activitiesRes.body[0];
}

it("Can get campaign activities", async () => {
  const {campaignId} = await createActivityEntry();

  const activitiesRes = await request(app)
    .get(`/campaigns/${campaignId}/activities`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  expect(Array.isArray(activitiesRes.body)).toBeTruthy();
  expect(activitiesRes.body.length).toBeGreaterThanOrEqual(1);
});

it("Can get multiple campaigns activities", async () => {
  const {campaignId: cId1} = await createActivityEntry();
  const {campaignId: cId2} = await createActivityEntry();
  const activitiesRes = await request(app)
    .get(`/activities?campaignIds=${cId1},${cId2}`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  expect(Array.isArray(activitiesRes.body)).toBeTruthy();
  expect(activitiesRes.body.length).toBeGreaterThanOrEqual(1);
});

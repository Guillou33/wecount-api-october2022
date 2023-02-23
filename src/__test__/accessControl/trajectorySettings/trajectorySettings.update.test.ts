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

let trajectorySettingsId: number;

beforeAll(async () => {
  const res = await request(app)
    .get("/perimeters/3/trajectory-settings")
    .set("Authorization", `Bearer ${getJwtUser(theAdmin)}`);
  trajectorySettingsId = res.body.id;
});

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
])("Denies scope targets update by a %s", async (_, user) => {
  await request(app)
    .post(`/trajectory-settings/${trajectorySettingsId}/scope-targets/upstream`)
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      target: 0,
      description: "updated-description",
    })
    .expect(403);
});

it.each([
  ["perimeter admin", theAdmin],
  ["perimeter manager", userManager],
])("Allows scope targets update by a %s", async (_, user) => {
  await request(app)
    .post(`/trajectory-settings/${trajectorySettingsId}/scope-targets/upstream`)
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      target: 0,
      description: "updated-description",
    })
    .expect(200);
});

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
])("Denies target year update by a %s", async (_, user) => {
  await request(app)
    .post(`/trajectory-settings/${trajectorySettingsId}/target-year`)
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      targetYear: 0,
    })
    .expect(403);
});

it.each([
  ["perimeter admin", theAdmin],
  ["perimeter manager", userManager],
])("Allows target year update by a %s", async (_, user) => {
  await request(app)
    .post(`/trajectory-settings/${trajectorySettingsId}/target-year`)
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      targetYear: 0,
    })
    .expect(200);
});

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

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
])("Denies entry tags update by a %s", async (_, user) => {
  await request(app)
    .put("/entry-tags/2")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      name: "updated-entry-tag",
    })
    .expect(403);
});

it.each([
  ["perimeter admin", theAdmin],
  ["perimeter manager", userManager],
])("Allows entry tags update by a %s", async (_, user) => {
  await request(app)
    .put("/entry-tags/2")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      name: "updated-entry-tag",
    })
    .expect(200);
});

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
])("Denies entry tags unarchive by a %s", async (_, user) => {
  await request(app)
    .post("/entry-tags/2/unarchive")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});

it.each([
  ["perimeter admin", theAdmin],
  ["perimeter manager", userManager],
])("Allows entry tags unarchive by a %s", async (_, user) => {
  await request(app)
    .post("/entry-tags/2/unarchive")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(200);
});

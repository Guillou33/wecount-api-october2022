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
])("Denies products update by a %s", async (_, user) => {
  await request(app)
    .put("/products/2")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      name: "updated-site",
      description: "updated-description",
      quantity: 0,
    })
    .expect(403);
});

it.each([
  ["perimeter admin", theAdmin],
  ["perimeter manager", userManager],
])("Allows products update by a %s", async (_, user) => {
  await request(app)
    .put("/products/2")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      name: "updated-site",
      description: "updated-description",
      quantity: 0,
    })
    .expect(200);
});

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
])("Denies products unarchive by a %s", async (_, user) => {
  await request(app)
    .post("/products/2/unarchive")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});

it.each([
  ["perimeter admin", theAdmin],
  ["perimeter manager", userManager],
])("Allows products unarchive by a %s", async (_, user) => {
  await request(app)
    .post("/products/2/unarchive")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(200);
});

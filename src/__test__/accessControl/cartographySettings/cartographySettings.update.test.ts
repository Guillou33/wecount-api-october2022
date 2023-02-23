import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  theAdmin,
  userFour,
  userManager,
  weepulseAdmin,
  userCollaborator,
} from "@root/test/mock/users";

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
])("Denies visible activity model updates by a %s", async (_, user) => {
  await request(app)
    .post(`/userPreferences/activityModel`)
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      perimeterId: 3,
      visibleActivityModels: ["UPSTREAM_FRET_AMONT_AVION_141280762"],
    })
    .expect(403);
});

it.each([
  ["perimeter admin", theAdmin],
  ["perimeter manager", userManager],
])("Allows visible activity model updates by a %s", async (_, user) => {
  await request(app)
    .post(`/userPreferences/activityModel`)
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      perimeterId: 3,
      visibleActivityModels: ["UPSTREAM_FRET_AMONT_AVION_141280762"],
    })
    .expect(200);
});

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
])("Denies category preferences updates by a %s", async (_, user) => {
  await request(app)
    .post(`/userPreferences/activityCategories`)
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      categorySettings: [
        {
          activityCategoryId: 1,
          description: "rrtertzrfzrferf",
          order: 122,
        },
      ],
      perimeterId: 3,
    })
    .expect(403);
});

it.each([
  ["perimeter admin", theAdmin],
  ["perimeter manager", userManager],
])("Allows category preferences updates by a %s", async (_, user) => {
  await request(app)
    .post(`/userPreferences/activityCategories`)
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      categorySettings: [
        {
          activityCategoryId: 1,
          description: "rrtertzrfzrferf",
          order: 122,
        },
      ],
      perimeterId: 3,
    })
    .expect(200);
});

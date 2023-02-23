import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  theAdmin,
  userFour,
  weepulseAdmin,
} from "@root/test/mock/users";

it.each([
  ["perimeter", userFour],
  ["company", weepulseAdmin],
])(
  "Denies access to cartography settings for a user out of %s",
  async (_, user) => {
    await request(app)
      .get("/perimeters/4/cartographySettings")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  }
);

it.each([
  ["in perimeter assignment", userFour],
  ["as perimeter admin", theAdmin],
])("Allows access to cartography settings %s", async (_, user) => {
  await request(app)
    .get("/perimeters/2/cartographySettings")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(200);
});

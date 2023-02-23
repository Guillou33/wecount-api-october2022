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

describe("Update sites", () => {
  it.each([
    ["perimeter contributor", userFour],
    ["perimeter collaborator", userCollaborator],
    ["user out of company", weepulseAdmin],
  ])("Denies user role update by a %s", async (_, user) => {
    await request(app)
      .post("/perimeters/3/user-role")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        userId: 4,
        role: "PERIMETER_CONTRIBUTOR",
      })
      .expect(403);
  });

  it.each([
    ["perimeter admin", theAdmin],
    ["perimeter manager", userManager],
  ])("Allows user role update by a %s", async (_, user) => {
    await request(app)
      .post("/perimeters/3/user-role")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        userId: 4,
        role: "PERIMETER_CONTRIBUTOR",
      })
      .expect(200);
  });
});

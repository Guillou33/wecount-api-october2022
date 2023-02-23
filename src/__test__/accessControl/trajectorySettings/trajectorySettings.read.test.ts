import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  theAdmin,
  userFour,
  weepulseAdmin,
} from "@root/test/mock/users";

describe("Read trajectory settings", () => {
  it.each([
    ["perimeter", userFour],
    ["company", weepulseAdmin],
  ])("Denies access to a trajectory settings out of %s", async (_, user) => {
    await request(app)
      .get("/perimeters/4/trajectory-settings")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  });

  it.each([
    ["in perimeter assignement", userFour],
    ["as perimeter admin", theAdmin],
  ])("Allows access to a trajectory settings %s", async (_, user) => {
    await request(app)
      .get("/perimeters/2/trajectory-settings")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(200);
  });
});

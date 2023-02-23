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

describe("Read users", () => {
  it.each([
    ["an admin", theAdmin, [3, 4, 5, 7, 8, 9, 10]],
    ["a user", userFour, [3, 4, 5, 7, 8, 9, 10]],
  ])(
    "Fetches the correct users in a given perimeter for %s",
    async (_, user, expected) => {
      const res = await request(app)
        .get(`/perimeters/3/users`)
        .set("Authorization", `Bearer ${getJwtUser(user)}`);

      expect(res.status).toBe(200);
      expect(
        res.body
          .map((ressource: any) => ressource.id)
          .sort((a: number, b: number) => a - b)
      ).toEqual(expected);
    }
  );

  it.each([
    ["assignment", userFour],
    ["company", weepulseAdmin],
  ])("Denies access to perimeter users out of user %s", async (_, user) => {
    await request(app)
      .get("/perimeters/4/users")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  });
});

describe("Write users", () => {
  it.each([
    ["contributor", userFour],
    ["collaborator", userCollaborator],
  ])("Denies user creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/perimeters/4/users")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        email: "new-user@test.com",
        firstName: "new",
        lastName: "user",
        role: "PERIMETER_CONTRIBUTOR",
      })
      .expect(403);
  });

  it.each([
    ["admin", theAdmin],
    ["manager", userManager],
  ])("Allows user creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/perimeters/3/users")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        email: "new-user@test.com",
        firstName: "new",
        lastName: "user",
        role: "PERIMETER_CONTRIBUTOR",
      })
      .expect(200);
  });
});

import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  theAdmin,
  userTwo,
  userFour,
  userManager,
  userCollaborator,
  weepulseAdmin,
} from "@root/test/mock/users";

describe("Read entry tags", () => {
  it.each([
    ["an admin", theAdmin, [1, 2, 3]],
    ["a user in 1 perimeter", userTwo, [1]],
    ["a user in 2 perimeters", userFour, [1, 2]],
  ])(
    "Fetches the correct entry tags for %s",
    async (_, user, expected) => {
      const res = await request(app)
        .get(`/entry-tags`)
        .set("Authorization", `Bearer ${getJwtUser(user)}`);

      expect(res.status).toBe(200);
      expect(res.body.map((ressource: any) => ressource.id).sort()).toEqual(
        expected
      );
    }
  );

  it.each([
    ["an admin", theAdmin, [2]],
    ["a user", userFour, [2]],
  ])(
    "Fetches the correct entry tags in a given perimeter for %s",
    async (_, user, expected) => {
      const res = await request(app)
        .get(`/perimeters/3/entry-tags`)
        .set("Authorization", `Bearer ${getJwtUser(user)}`);

      expect(res.status).toBe(200);
      expect(res.body.map((ressource: any) => ressource.id).sort()).toEqual(
        expected
      );
    }
  );

  it.each([
    ["assignment", userFour],
    ["company", weepulseAdmin],
  ])(
    "Denies access to a perimeter entry tags out of user %s",
    async (_, user) => {
      await request(app)
        .get("/perimeters/4/entry-tags")
        .set("Authorization", `Bearer ${getJwtUser(user)}`)
        .expect(403);
    }
  );
});

describe("Write entry tags", () => {
  it.each([
    ["contributor", userFour],
    ["collaborator", userCollaborator],
  ])("Denies entry tags creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/entry-tags")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        perimeterId: 3,
        name: "new-entry-tag",
      })
      .expect(403);
  });

  it.each([
    ["admin", theAdmin],
    ["manager", userManager],
  ])("Allows entry tags creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/entry-tags")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        perimeterId: 3,
        name: "new-entry-tag",
      })
      .expect(201);
  });
});

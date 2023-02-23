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

describe("Read products", () => {
  it.each([
    ["an admin", theAdmin, [1, 2, 3]],
    ["an user in 1 perimeter", userTwo, [1]],
    ["an user in 2 perimeters", userFour, [1, 2]],
  ])("Fetches the correct products for %s", async (_, user, expected) => {
    const res = await request(app)
      .get(`/products`)
      .set("Authorization", `Bearer ${getJwtUser(user)}`);

    expect(res.status).toBe(200);
    expect(res.body.map((ressource: any) => ressource.id).sort()).toEqual(
      expected
    );
  });

  it.each([
    ["an admin", theAdmin, [2]],
    ["a user", userFour, [2]],
  ])(
    "Fetches the correct products in a given perimeter for %s",
    async (_, user, expected) => {
      const res = await request(app)
        .get(`/perimeters/3/products`)
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
  ])("Denies access to a perimeter products out of user ", async (_, user) => {
    await request(app)
      .get("/perimeters/4/products")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  });
});

describe("Write products", () => {
  it.each([
    ["contributor", userFour],
    ["collaborator", userCollaborator],
  ])("Denies products creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        perimeterId: 3,
        name: "new-product",
        description: "",
        quantity: 0,
      })
      .expect(403);
  });

  it.each([
    ["admin", theAdmin],
    ["manager", userManager],
  ])("Allows products creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({
        perimeterId: 3,
        name: "new-product",
        description: "",
        quantity: 0,
      })
      .expect(201);
  });
});

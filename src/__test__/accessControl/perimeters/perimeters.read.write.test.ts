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

describe("Read perimeters", () => {
  it.each([
    ["an admin", theAdmin, [2, 3, 4]],
    ["a user in 1 perimeter", userTwo, [2]],
    ["a user in 2 perimeters", userFour, [2, 3]],
  ])("Fetches the correct perimeters for %s", async (_, user, expected) => {
    const res = await request(app)
      .get(`/perimeters`)
      .set("Authorization", `Bearer ${getJwtUser(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.map((ressource: any) => ressource.id).sort()).toEqual(
      expected
    );
  });

  it.each([
    ["assignment", userFour],
    ["company", weepulseAdmin],
  ])("Denies access to a perimeter out of user %s", async (_, user) => {
    await request(app)
      .get("/perimeters/4")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  });

  it.each([
    ["in user assignment", userFour],
    ["as perimeter admin", theAdmin],
  ])("Allows access to a perimeter %s", async (_, user) => {
    await request(app)
      .get("/perimeters/2")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(200);
  });
});

describe("Write perimeters", () => {
  it.each([
    ["contributor", userFour],
    ["collaborator", userCollaborator],
    ["manager", userManager],
  ])("Denies perimeter creation by a perimeter %s", async () => {
    await request(app)
      .post("/perimeters")
      .set("Authorization", `Bearer ${getJwtUser(userFour)}`)
      .send({
        name: "new perimeter",
      })
      .expect(403);
  });

  it("Allows perimeter creation by a perimeter admin", async () => {
    await request(app)
      .post("/perimeters")
      .set("Authorization", `Bearer ${getJwtUser(theAdmin)}`)
      .send({
        name: "new perimeter",
      })
      .expect(201);
  });
});



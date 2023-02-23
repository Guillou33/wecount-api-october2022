import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  userFour,
  userTwo,
  userCollaborator,
  userManager,
  theAdmin,
  weepulseAdmin,
} from "@root/test/mock/users";

describe("Read activities", () => {
  it.each([
    ["assignment", userTwo],
    ["company", weepulseAdmin],
  ])("Denies access to activities out of user %s", async (_, user) => {
    await request(app)
      .get("/campaigns/2/activities")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  });

  it.each([
    ["a contributor", userFour],
    ["a collaborator", userCollaborator],
    ["a manager", userManager],
    ["an admin", theAdmin],
  ])(
    "Fetches the correct activities in a given campaign for %s",
    async (_, user) => {
      const res = await request(app)
        .get(`/campaigns/2/activities`)
        .set("Authorization", `Bearer ${getJwtUser(user)}`);

      expect(res.status).toBe(200);
      expect(res.body.map((ressource: any) => ressource.id).sort()).toEqual([
        1,
      ]);
    }
  );
});


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
  entryWriter,
} from "@root/test/mock/users";

import { validData } from "@root/test/utils/multipleEntriesTestData";
import { activityEntryDefaults } from "./activityEntries.update.test";

describe("Read activity entries", () => {
  it.each([
    ["assignment", userTwo],
    ["company", weepulseAdmin],
  ])("Denies access to activity entries out of user %s", async (_, user) => {
    await request(app)
      .get("/campaigns/2/activity-entries")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  });

  it.each([
    ["a contributor", userFour, []],
    ["a contributorwith writer rights", entryWriter, [1]],
    ["a collaborator", userCollaborator, [1]],
    ["a manager", userManager, [1]],
    ["an admin", theAdmin, [1]],
  ])(
    "Fetches the correct activity entries in a given perimeter for %s",
    async (_, user, expected) => {
      const res = await request(app)
        .get(`/campaigns/2/activity-entries`)
        .set("Authorization", `Bearer ${getJwtUser(user)}`);

      const entryIds = res.body.map((entry: any) => entry.id);

      expect(res.status).toBe(200);
      expect(entryIds).toEqual(expected);
    }
  );
});

describe("Write activity entries", () => {
  it.each([
    ["contributor", userFour],
    ["collaborator", userCollaborator],
    ["user out of company", weepulseAdmin],
  ])("Denies activity entries creation by a %s", async (_, user) => {
    await request(app)
      .post("/campaigns/2/activity-entries")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({ ...activityEntryDefaults, activityModelId: 1 })
      .expect(403);
  });

  it.each([
    ["admin", theAdmin],
    ["manager", userManager],
  ])("Allows activity entries creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/campaigns/2/activity-entries")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send({ ...activityEntryDefaults, activityModelId: 1 })
      .expect(201);
  });

  it.each([
    ["contributor", userFour],
    ["collaborator", userCollaborator],
    ["user out of company", weepulseAdmin],
  ])("Denies activity multiple entries creation by a %s", async (_, user) => {
    await request(app)
      .post("/campaigns/2/entries/create-multiple")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send([validData])
      .expect(403);
  });

  it.each([
    ["admin", theAdmin],
    ["manager", userManager],
  ])("Allows activity entries creation by a perimeter %s", async (_, user) => {
    await request(app)
      .post("/campaigns/2/entries/create-multiple")
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .send([validData])
      .expect(201);
  });
});

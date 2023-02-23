import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  userFour,
  userCollaborator,
  weepulseAdmin,
} from "@root/test/mock/users";

it.each([
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
])("Denies campaign deletions by a %s", async (_, user) => {
  await request(app)
    .del("/campaigns/2")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});
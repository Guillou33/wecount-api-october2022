import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  userFour,
  userManager,
  userCollaborator,
  weepulseAdmin,
} from "@root/test/mock/users";

it.each([
  ["perimeter manager", userManager],
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
])("Denies perimeter deletions by a %s", async (_, user) => {
  await request(app)
    .del("/perimeters/3")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});

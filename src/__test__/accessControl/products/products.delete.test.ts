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
])("Denies products deletions by a %s", async (_, user) => {
  await request(app)
    .post("/products/2/archive")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});

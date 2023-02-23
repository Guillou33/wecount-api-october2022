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

it.each([
  ["perimeter manager", userManager],
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
])("Denies perimeter updates by a %s", async (_, user) => {
  await request(app)
    .put("/perimeters/3")
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .send({
      name: "new name",
      description: "new description",
    })
    .expect(403);
});

it("Allow perimeter update by a perimeter admin", async () => {
  await request(app)
    .put("/perimeters/3")
    .set("Authorization", `Bearer ${getJwtUser(theAdmin)}`)
    .send({
      name: "new name",
      description: "new description",
    })
    .expect(200);
});

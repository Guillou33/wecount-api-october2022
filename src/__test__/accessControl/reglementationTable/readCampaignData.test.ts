import request from "supertest";
import { app } from "@root/app";

import { ReglementationTableCode } from "@root/entity/enum/ReglementationTableCode";

import { getJwtUser } from "@root/test/utils/utils";
import {
  theAdmin,
  userTwo,
  userFour,
  userManager,
  userCollaborator,
  weepulseAdmin,
} from "@root/test/mock/users";

describe("Read reglementation table", () => {
  it.each([
    ["contributor", userFour],
    ["user out of perimeter", userTwo],
    ["user out of company", weepulseAdmin],
  ])("Denies access to a %s", async (_, user) => {
    const reqs = Object.values(ReglementationTableCode).map(code =>
      request(app)
        .get(`/reglementation-tables/campaign-data/2/${code}`)
        .set("Authorization", `Bearer ${getJwtUser(user)}`)
    );
    const responses = await Promise.all(reqs);
    expect(responses.every(res => res.status === 403)).toBe(true);
  });

  it.each([
    ["collaborator", userCollaborator],
    ["manager", userManager],
    ["admin", theAdmin],
  ])("Allows access to a %s", async (_, user) => {
    const reqs = Object.values(ReglementationTableCode).map(code =>
      request(app)
        .get(`/reglementation-tables/campaign-data/2/${code}`)
        .set("Authorization", `Bearer ${getJwtUser(user)}`)
    );
    const responses = await Promise.all(reqs);
    expect(responses.every(res => res.status === 200)).toBe(true);
  });
});

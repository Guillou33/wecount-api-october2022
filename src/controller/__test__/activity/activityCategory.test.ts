import request from "supertest";
import { app } from "@root/app";
import { testString } from '@service/utils/tokenGenerator';
import { getJwtUser } from "@root/test/utils/utils";
import { SCOPE } from "@entity/enum/Scope";

it("Can't get categories if not logged in", async () => {
  await request(app)
    .get("/activity-categories")
    .send()
    .expect(403);
});

it("Can get categories", async () => {
  const response = await request(app)
    .get("/activity-categories")
    .set('Authorization', `Bearer ${getJwtUser()}`)
    .send()
    .expect(200);
  
  expect(Array.isArray(response.body)).toBeTruthy();
  const firstCateg = response.body[0];
  expect(Object.values(SCOPE).indexOf(firstCateg.scope) !== 1).toBeTruthy();
  expect(Array.isArray(firstCateg.activityModels)).toBeTruthy();
});

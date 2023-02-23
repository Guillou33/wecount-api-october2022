import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";

it("Can't get compute methods if not logged in", async () => {
  await request(app)
    .get("/compute-method")
    .send()
    .expect(403);
});

it("Can get compute methods for an activity model id", async () => {
  const activityModelResponse = await request(app)
    .get("/activity-categories")
    .set('Authorization', `Bearer ${getJwtUser()}`)
    .expect(200);
  
  expect(Array.isArray(activityModelResponse.body)).toBeTruthy();
  const firstCateg = activityModelResponse.body[0];
  
  expect(Array.isArray(firstCateg.activityModels)).toBeTruthy();
  const activityModelId = firstCateg.activityModels[0].id;

  const response = await request(app)
    .get("/compute-method")
    .set('Authorization', `Bearer ${getJwtUser()}`)
    .query({
      activityModelId
    })
    .expect(200);

  expect(Array.isArray(response.body)).toBeTruthy();

  // Has TagLabels nested, and Tags
  expect(response.body[0].rootTagLabels[0].childrenTagLabels[0].emissionFactorTags.length).toBeGreaterThan(0);
});

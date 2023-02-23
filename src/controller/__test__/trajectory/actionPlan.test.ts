import request from "supertest";
import { app } from "@root/app";
import { testString } from "@service/utils/tokenGenerator";
import { getManager } from "typeorm";
import { ActivityCategory, ActionPlan } from "@entity/index";
import { SCOPE } from "@entity/enum/Scope";
import { getJwtUser } from "@root/test/utils/utils";
import { getTestTrajectory } from "@controller/__test__/trajectory/trajectory.test";
import { weepulseAdmin } from "@root/test/mock/users";

async function getTestCategory(): Promise<ActivityCategory> {
  const em = getManager();
  const category = em.create(ActivityCategory);
  category.nameContentCode = testString();
  category.scope = SCOPE.UPSTREAM;

  return em.save(category);
}

async function getTestActionPlan(): Promise<number> {
  const trajectoryId = await getTestTrajectory();
  const category = await getTestCategory();

  const res = await request(app)
    .post("/action-plans")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({ campaignTrajectoryId: trajectoryId, categoryId: category.id })
    .expect(200);

  return Number(res.body.id);
}

it("Can create an action plan", async () => {
  const trajectoryId = await getTestTrajectory();
  const category = await getTestCategory();

  await request(app)
    .post("/action-plans")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({ campaignTrajectoryId: trajectoryId, categoryId: category.id })
    .expect(200);
});

it("Can update an action plan", async () => {
  const actionPlanId = await getTestActionPlan();

  const comments = testString();

  const res = await request(app)
    .put(`/action-plans/${actionPlanId}`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      actionId: null,
      reduction: 0.12,
      comments,
      description: null,
    })
    .expect(200);

  expect(res.body.reduction).toBe(0.12);
  expect(res.body.comments).toBe(comments);
  expect(res.body.description).toBeNull();
});

it("Can delete an action plan", async () => {
  const actionPlanId = await getTestActionPlan();

  await request(app)
    .delete(`/action-plans/${actionPlanId}`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .expect(204);

  await request(app)
    .get(`/action-plans/${actionPlanId}`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .expect(404);
});

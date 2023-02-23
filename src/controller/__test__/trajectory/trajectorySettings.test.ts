import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";
import { weepulseAdmin } from "@root/test/mock/users";

async function getTestTrajectorySettings() {
  const perimeterId = 1;
  const res = await request(app)
    .get(`/perimeters/${perimeterId}/trajectory-settings`)
    .set("Authorization", `Bearer ${getJwtUser()}`);

  return res.body.id;
}

it("Can get a trajectory settings", async () => {
  const trajectorySettingsId = await getTestTrajectorySettings();
  
  expect(trajectorySettingsId).toBeTruthy();
});

it("Can update scope targets", async () => {
  const trajectorySettingsId = await getTestTrajectorySettings();

  const res = await request(app)
    .post(`/trajectory-settings/${trajectorySettingsId}/scope-targets/upstream`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      target: 0.25,
    });

  expect(res.status).toBe(200);
  const scopeTarget = res.body.scopeTargets.find(
    (scopeTarget: any) => scopeTarget.scope === "UPSTREAM"
  );
  expect(scopeTarget).toMatchObject({
    scope: "UPSTREAM",
    target: 0.25,
    description: null,
  });
});

it("Can update target year", async () => {
  const trajectorySettingsId = await getTestTrajectorySettings();
  const newTargetYear = 2044;

  const res = await request(app)
    .post(`/trajectory-settings/${trajectorySettingsId}/target-year`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      targetYear: newTargetYear,
    })
    .expect(200);
    expect(res.body.targetYear).toBe(newTargetYear);
});

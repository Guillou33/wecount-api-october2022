import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";
import { createTestCampaign } from '@controller/__test__/core/campaign.test';


export async function getTestTrajectory(): Promise<number> {
  const { campaignId } = await createTestCampaign();
  const res = await request(app)
    .post("/trajectories/")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      campaignId,
    });

  return Number(res.body.id);
}

it("Can't get trajectory if not logged in", async () => {
  await request(app).get("/trajectories").send().expect(403);
});

it("Can create a trajectory", async () => {
  const { campaignId } = await createTestCampaign();

  await request(app)
    .post("/trajectories/")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send({
      campaignId,
    })
    .expect(201);
});

it("Can get a trajectory", async () => {
  const trajectoryId = await getTestTrajectory();

  await request(app)
    .get(`/trajectories/${trajectoryId}`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(200);
});

it("Removes a trajectory", async () => {
  const trajectoryId = await getTestTrajectory();

  await request(app)
    .delete(`/trajectories/${trajectoryId}`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(204);

  await request(app)
    .get(`/trajectories/${trajectoryId}`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(404);
});


it("Can delete a trajectory", async () => {
  const trajectoryId = await getTestTrajectory();

  await request(app)
    .delete(`/trajectories/${trajectoryId}`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(204);

  await request(app)
    .get(`/trajectories/${trajectoryId}`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(404);
});

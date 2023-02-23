import request from "supertest";
import { app } from "@root/app";
import { testString } from '@service/utils/tokenGenerator';
import { getJwtUser } from "@root/test/utils/utils";
import { getCustomRepository, getManager } from 'typeorm';
import { ActivityEntry, ActivityModel } from "@entity/index";
import { Status } from "@entity/enum/Status";
import { getLastActivity } from '@controller/__test__/activity/activity.test';
import { createTestCampaign } from '@controller/__test__/core/campaign.test';
import { ActivityModelRepository, ComputeMethodRepository } from "@root/repository";
import { ComputeMethodType } from "@root/entity/enum/ComputeMethodType";
import { weepulseAdmin } from "@root/test/mock/users";

export const createActivityEntry = async () => {
  const {campaignId} = await createTestCampaign();
  
  const activityModelId = 1;
  const computeMethods = await getCustomRepository(ComputeMethodRepository).findByActivityModelId(activityModelId);
  const computeMethodId = computeMethods[0].id;

  await request(app)
    .post(`/campaigns/${campaignId}/activity-entries`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      computeMethodId,
      activityModelId,
      computeMethodType: ComputeMethodType.STANDARD,
      uncertainty: 0.3,
      value: 1,
      value2: 13,
      title: testString(),
      description: testString(),
      isExcludedFromTrajectory: false,
      dataSource: null,
      emissionFactorId: 1,
      status: Status.IN_PROGRESS,
      ownerId: null,
      writerId: null,
      entryTagIds: [],
    })
    .expect(201);

  return {
    computeMethodId,
    campaignId,
  }
}

export const getLastActivityEntry = async (campaignId: number) => {
  const activityEntriesRes = await request(app)
    .get(`/campaigns/${campaignId}/activity-entries`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  expect(Array.isArray(activityEntriesRes.body)).toBeTruthy();
  expect(activityEntriesRes.body.length).toBeGreaterThanOrEqual(1);
  expect(activityEntriesRes.body[0].activityEntryReference.referenceId).toBeTruthy();
  
  return activityEntriesRes.body[0];
}

export const duplicateActivityEntry = async ({
  campaignId,
  computeMethodId,
  activityEntry
} : {
  campaignId: number;
  computeMethodId: number;
  activityEntry: ActivityEntry;
}) => {
  const activityEntryDuplicated = await request(app)
    .post(`/campaigns/${campaignId}/activity-entries/${activityEntry.id}/duplicate`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      computeMethodId: computeMethodId
    })
    .expect(200);

  return activityEntryDuplicated.body;
}

it("Can create an activity entry", async () => {
  await createActivityEntry();
});

it("Can get activity entries", async () => {
  const { campaignId } = await createActivityEntry();

  await request(app)
    .get(`/campaigns/${campaignId}/activity-entries`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);
});


it("Can get activity entry reference history", async () => {
  const { campaignId } = await createActivityEntry();
  const activityEntry = await getLastActivityEntry(campaignId);

  const activityEntriesRes = await request(app)
    .get(`/campaigns/${campaignId}/activity-entries/${activityEntry.id}/reference-history`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  expect(Array.isArray(activityEntriesRes.body)).toBeTruthy();
  expect(activityEntriesRes.body.length).toBeGreaterThanOrEqual(1);
});

it("Can update activity entry", async () => {
  const { campaignId, computeMethodId } = await createActivityEntry();
  const activityEntry = await getLastActivityEntry(campaignId);

  const newUncertainty = 0.4;
  const newDescription = testString();
  const newTitle = testString();
  const newDataSource = testString();

  await request(app)
    .put(`/campaigns/${campaignId}/activity-entries/${activityEntry.id}`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      computeMethodId,
      computeMethodType: ComputeMethodType.STANDARD,
      uncertainty: newUncertainty,
      value: 2,
      value2: 13,
      title: newTitle,
      description: newDescription,
      isExcludedFromTrajectory: false,
      dataSource: newDataSource,
      emissionFactorId: 2,
      status: Status.IN_PROGRESS,
      instruction: null,
      ownerId: null,
      writerId: null,
      entryTagIds: [],
    })
    .expect(200);
  
  const em = getManager();
  const activityEntryUpdated = await em.findOne(ActivityEntry, activityEntry.id);
  if (!activityEntryUpdated) {
    throw new Error("Activity updated is not found");
  }

  expect(activityEntryUpdated.uncertainty).toBe(newUncertainty);
  expect(activityEntryUpdated.description).toBe(newDescription);
  expect(activityEntryUpdated.title).toBe(newTitle);
  expect(activityEntryUpdated.dataSource).toBe(newDataSource);
});

it("Can delete activity entry", async () => {
  const { campaignId } = await createActivityEntry();
  const activityEntry = await getLastActivityEntry(campaignId);

  await request(app)
    .delete(`/campaigns/${campaignId}/activity-entries/${activityEntry.id}`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(204);
  
  const em = getManager();
  const activityEntryDeleted = await em.findOne(ActivityEntry, activityEntry.id);

  expect(activityEntryDeleted).toBeFalsy();
});

it("Can get csv export", async () => {
  const {campaignId} = await createActivityEntry();

  const csvResponse = await request(app)
    .get(`/campaigns/${campaignId}/csv`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);
});

it("Can duplicate entry", async () => {
  const {campaignId, computeMethodId} = await createActivityEntry();
  const activityEntry = await getLastActivityEntry(campaignId);

  const entryDuplicated = await duplicateActivityEntry({
    campaignId,
    computeMethodId,
    activityEntry,
  });

  const em = getManager();
  const oldEntry = await em.findOne(ActivityEntry, activityEntry.id);
  const newEntry = await em.findOne(ActivityEntry, entryDuplicated.id);
  const allActivityEntries = await em.find(ActivityEntry);

  expect(allActivityEntries).toEqual(
    expect.arrayContaining([
      expect.objectContaining(oldEntry)
    ])
  );
  expect(allActivityEntries).toEqual(
    expect.arrayContaining([
      expect.objectContaining(newEntry)
    ])
  );
  expect({
    ...oldEntry,
    id: newEntry?.id,
    createdAt: newEntry?.createdAt,
    updatedAt: newEntry?.updatedAt
  }).toEqual(newEntry);
})
it("Can submit entry for validation", async () => {
  const {campaignId} = await createActivityEntry();
  const activityEntry = await getLastActivityEntry(campaignId);

  const res = await request(app)
    .post(`/campaigns/${campaignId}/activity-entries/${activityEntry.id}/submit-for-validation`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send();

  expect(res.status).toBe(200);
  expect(res.body.status).toBe(Status.TO_VALIDATE);
})


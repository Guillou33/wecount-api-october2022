import request from "supertest";
import { app } from "@root/app";
import { testString } from '@service/utils/tokenGenerator';
import { getManager } from 'typeorm';
import { EntryTag } from "@entity/index";
import { getJwtUser } from "@root/test/utils/utils";
import { weepulseAdmin } from "@root/test/mock/users";

let testName = testString();

it("Can't get an entry tag if not logged in", async () => {
  await request(app)
    .get("/entr-tags")
    .send()
    .expect(403);
});

it("Can create an entry tag", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/entry-tags")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      perimeterId,
    })
    .expect(201);
});

it("Can get entry tags", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/entry-tags")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      perimeterId,
    })
    .expect(201);

  await request(app)
    .get(`/entry-tags`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200)
    .then((res) => {
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
});

it("Can archive / unarchive an entry tag", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/entry-tags")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      perimeterId,
    })
    .expect(201);

  const em = getManager();
  const entryTag = await em.findOne(EntryTag, { order: { createdAt: "DESC" } });
  expect(entryTag).toBeTruthy();
  if (!entryTag) {
    throw new Error("No entry tag in db");
  } 
  const entryTagId = entryTag.id;

  await request(app)
    .post(`/entry-tags/${entryTagId}/archive`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  const entryTagRefreshed = await em.findOne(EntryTag, entryTagId);
  expect(entryTagRefreshed!.archivedDate).toBeTruthy();

  await request(app)
    .post(`/entry-tags/${entryTagId}/unarchive`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  const entryTagRefreshedUnarchived = await em.findOne(EntryTag, entryTagId);
  expect(entryTagRefreshedUnarchived!.archivedDate).toBeFalsy();
});


it("Can update an entry tag", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/entry-tags")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      perimeterId,
    })
    .expect(201);

  const em = getManager();
  const entryTag = await em.findOne(EntryTag, { order: { createdAt: "DESC" } });
  expect(entryTag).toBeTruthy();
  if (!entryTag) {
    throw new Error("No entry tag in db");
  } 
  const entryTagId = entryTag.id;

  const newName = 'modified_' + testString();
  await request(app)
    .put(`/entry-tags/${entryTagId}`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: newName,
    })
    .expect(200);

  const entryTagUpdated = await em.findOne(EntryTag, entryTagId);
  if (!entryTagUpdated) {
    throw new Error("Entry tag has no name");
  } 

  expect(entryTagUpdated.name).toBe(newName);
});

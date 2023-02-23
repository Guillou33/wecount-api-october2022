import request from "supertest";
import { app } from "@root/app";
import { testString } from '@service/utils/tokenGenerator';
import { getManager } from 'typeorm';
import { Site } from "@entity/index";
import { getJwtUser } from "@root/test/utils/utils";
import { weepulseAdmin } from "@root/test/mock/users";

let testName = testString();
let testDescription = testString();

it("Can't get a site if not logged in", async () => {
  await request(app)
    .get("/sites")
    .send()
    .expect(403);
});

it("Can create a site", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/sites")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      description: testDescription,
      perimeterId,
      parentSiteId: null
    })
    .expect(201);
});

it("Can get sites", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/sites")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      description: testDescription,
      perimeterId,
      parentSiteId: null
    })
    .expect(201);

  await request(app)
    .get(`/sites`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200)
    .then((res) => {
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
});

it("Can archive / unarchive a site", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/sites")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      description: testDescription,
      perimeterId,
      parentSiteId: null
    })
    .expect(201);

  const em = getManager();
  const site = await em.findOne(Site, { order: { createdAt: "DESC" } });
  expect(site).toBeTruthy();
  if (!site) {
    throw new Error("No site in db");
  } 
  const siteId = site.id;

  await request(app)
    .post(`/sites/${siteId}/archive`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  const siteRefreshed = await em.findOne(Site, siteId);
  expect(siteRefreshed!.archivedDate).toBeTruthy();

  await request(app)
    .post(`/sites/${siteId}/unarchive`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  const siteRefreshedUnarchived = await em.findOne(Site, siteId);
  expect(siteRefreshedUnarchived!.archivedDate).toBeFalsy();
});


it("Can update a site", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/sites")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      description: testDescription,
      perimeterId,
      parentSiteId: null
    })
    .expect(201);

  const em = getManager();
  const site = await em.findOne(Site, { order: { createdAt: "DESC" } });
  expect(site).toBeTruthy();
  if (!site) {
    throw new Error("No site in db");
  } 
  const siteId = site.id;

  const newName = 'modified_' + testString();
  const newDescription = 'modified_' + testString();
  await request(app)
    .put(`/sites/${siteId}`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: newName,
      description: newDescription,
      parentSiteId: null
    })
    .expect(200);

  const siteUpdated = await em.findOne(Site, siteId);
  if (!siteUpdated) {
    throw new Error("Site has no name");
  } 

  expect(siteUpdated.name).toBe(newName);
  expect(siteUpdated.description).toBe(newDescription);
});

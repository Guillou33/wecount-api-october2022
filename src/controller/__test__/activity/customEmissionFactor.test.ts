import request from "supertest";
import { app } from "@root/app";
import { testString } from '@service/utils/tokenGenerator';
import { getManager } from 'typeorm';
import { getJwtUser } from "@root/test/utils/utils";
import { userManager } from "@root/test/mock/users";
import { CustomEmissionFactor } from "@root/entity/activity/CustomEmissionFactor";

let testName = testString();
let testInputName = testString();
let testUnit = testString();
let testComment = testString();

const ROUTE_PREFIX = "/custom-emission-factor";
const perimeterId = 3;

export const createCEF = async () => {
  await request(app)
    .post(ROUTE_PREFIX)
    .set('Authorization', `Bearer ${getJwtUser(userManager)}`)
    .send({
      perimeterId,
      value: 12.3,
      name: testName,
      input1Name: testInputName,
      input1Unit: testUnit,
      comment: testComment,
    })
    .expect(201);
};

it("Can't get CEF if not logged in", async () => {
  await request(app)
    .get(ROUTE_PREFIX)
    .send()
    .expect(403);
});

it("Can create a CEF", async () => {
  await createCEF();
});

it("Can get CEFs", async () => {
  await createCEF();

  await request(app)
    .get(ROUTE_PREFIX)
    .set('Authorization', `Bearer ${getJwtUser(userManager)}`)
    .send()
    .expect(200)
    .then((res) => {
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
});

it("Can autocomplete CEF", async () => {
  await request(app)
    .post(`${ROUTE_PREFIX}`)
    .set('Authorization', `Bearer ${getJwtUser(userManager)}`)
    .send({
      perimeterId,
      value: 12.3,
      name: testName,
      input1Name: testInputName,
      input1Unit: testUnit,
      comment: testComment,
    })
    .expect(201);

  const autocompleteResponse = await request(app)
    .get(`${ROUTE_PREFIX}?search=${testName}`)
    .set("Authorization", `Bearer ${getJwtUser(userManager)}`)
    .send()
    .expect(200);

  expect(Array.isArray(autocompleteResponse.body)).toBeTruthy();
  expect(autocompleteResponse.body.length).toBeTruthy();
});

it("Can archive / unarchive a CEF", async () => {
  await createCEF();

  const em = getManager();
  const cef = await em.findOne(CustomEmissionFactor, { order: { createdAt: "DESC" } });
  expect(cef).toBeTruthy();
  if (!cef) {
    throw new Error("No CustomEmissionFactor in db");
  } 
  const cefId = cef.id;

  await request(app)
    .post(`${ROUTE_PREFIX}/${cefId}/archive`)
    .set('Authorization', `Bearer ${getJwtUser(userManager)}`)
    .send()
    .expect(200);

  await request(app)
    .get(ROUTE_PREFIX)
    .set('Authorization', `Bearer ${getJwtUser(userManager)}`)
    .send()
    .expect(200)
    .then((res) => {
      const ids = res.body.filter((cef: any) => !cef.archivedDate).map((cef: any) => cef.id);
      expect(ids).not.toContain(cefId);
    });

  const cefRefreshed = await em.findOne(CustomEmissionFactor, cefId);
  expect(cefRefreshed!.archivedDate).toBeTruthy();

  await request(app)
    .post(`${ROUTE_PREFIX}/${cefId}/unarchive`)
    .set('Authorization', `Bearer ${getJwtUser(userManager)}`)
    .send()
    .expect(200);

  await request(app)
    .get(ROUTE_PREFIX)
    .set('Authorization', `Bearer ${getJwtUser(userManager)}`)
    .send()
    .expect(200)
    .then((res) => {
      const ids = res.body.filter((cef: any) => !cef.archivedDate).map((cef: any) => cef.id);
      expect(ids).toContain(cefId);
    });

  const cefRefreshed2 = await em.findOne(CustomEmissionFactor, cefId);
  expect(cefRefreshed2!.archivedDate).toBeFalsy();
});


it("Can update a CEF", async () => {
  await createCEF();

  const em = getManager();
  const cef = await em.findOne(CustomEmissionFactor, { order: { createdAt: "DESC" } });
  expect(cef).toBeTruthy();
  if (!cef) {
    throw new Error("No CustomEmissionFactor in db");
  } 
  const cefId = cef.id;

  const newValue = 9.24;
  const newName = 'modified_' + testString();
  const newInput1Name = 'modified_' + testString();
  const newInput1Unit = 'modified_' + testString();
  const newComment = 'modified_' + testString();
  await request(app)
    .put(`${ROUTE_PREFIX}/${cefId}`)
    .set('Authorization', `Bearer ${getJwtUser(userManager)}`)
    .send({
      perimeterId,
      value: newValue,
      name: newName,
      input1Name: newInput1Name,
      input1Unit: newInput1Unit,
      comment: newComment,
    })
    .expect(200);

  const cefUpdated = await em.findOne(CustomEmissionFactor, cefId);
  if (!cefUpdated) {
    throw new Error("CEF does not exist");
  } 

  expect(cefUpdated.value).toBe(newValue);
  expect(cefUpdated.name).toBe(newName);
  expect(cefUpdated.input1Name).toBe(newInput1Name);
  expect(cefUpdated.input1Unit).toBe(newInput1Unit);
  expect(cefUpdated.comment).toBe(newComment);
});

import request from "supertest";
import { app } from "@root/app";
import { getManager } from 'typeorm';
import { Company } from "@entity/index";
import { getJwtUser } from "@root/test/utils/utils";
import { ROLES } from "@root/service/core/security/auth/config";

it("Can't get companies if not admin", async () => {
  await request(app)
    .get("/companies/locked")
    .set('Authorization', `Bearer ${getJwtUser()}`)
    .send()
    .expect(403);

  await request(app)
    .get("/companies/unlocked")
    .set('Authorization', `Bearer ${getJwtUser()}`)
    .send()
    .expect(403);
});

it("Can get unlocked companies", async () => {
  await request(app)
    .get("/companies/unlocked?offset=0&length=10")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send()
    .expect(200);
});

it("Can get locked companies", async () => {
  await request(app)
    .get("/companies/locked?offset=0&length=10")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send()
    .expect(200);
});

it("Can lock company", async () => {
  const em = getManager();
  const company = await em.findOne(Company);

  expect(company).toBeTruthy();
  if (!company) {
    throw new Error("No company available");
  } 
  const companyId = company.id;

  await request(app)
    .post(`/companies/${companyId}/lock`)
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send()
    .expect(200);
});

it("Can unlock company", async () => {
  const em = getManager();
  const company = await em.findOne(Company);

  expect(company).toBeTruthy();
  if (!company) {
    throw new Error("No company available");
  } 
  const companyId = company.id;

  await request(app)
    .post(`/companies/${companyId}/unlock`)
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send()
    .expect(200);
});

it("Cannot update readonly mode if not admin", async () => {
  const em = getManager();
  const company = await em.findOne(Company);

  expect(company).toBeTruthy();
  if (!company) {
    throw new Error("No company available");
  }
  const companyId = company.id;

  await request(app)
    .put(`/companies/${companyId}/readonlyMode`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send()
    .expect(403);

  await request(app)
    .put(`/companies/${companyId}/readonlyMode`)
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send()
    .expect(403);
});

it("Can set company in read only mode", async () => {
  const em = getManager();
  const company = await em.findOne(Company);

  expect(company).toBeTruthy();
  if (!company) {
    throw new Error("No company available");
  }
  const companyId = company.id;

  const res = await request(app)
    .put(`/companies/${companyId}/readonlyMode`)
    .set("Authorization", `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send({ readonlyMode: true });

  expect(res.status).toBe(200);
  expect(res.body.readonlyMode).toBe(true);
});

it("Can set company in edition mode", async () => {
  const em = getManager();
  const company = await em.findOne(Company);

  expect(company).toBeTruthy();
  if (!company) {
    throw new Error("No company available");
  }
  const companyId = company.id;

  const res = await request(app)
    .put(`/companies/${companyId}/readonlyMode`)
    .set("Authorization", `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send({ readonlyMode: false });

  expect(res.status).toBe(200);
  expect(res.body.readonlyMode).toBe(false);
});

it("Denies malformed requests", async () => {
  const em = getManager();
  const company = await em.findOne(Company);

  expect(company).toBeTruthy();
  if (!company) {
    throw new Error("No company available");
  }
  const companyId = company.id;

  await request(app)
    .put(`/companies/${companyId}/readonlyMode`)
    .set("Authorization", `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send({})
    .expect(400);

  await request(app)
    .put(`/companies/${companyId}/readonlyMode`)
    .set("Authorization", `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send({ readonlyMode: 42 })
    .expect(400);
});

it("Cannot search companies if not admin", async ()=>{
  await request(app)
    .get("/companies/locked/search?name=test")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send()
    .expect(403);

  await request(app)
    .get("/companies/unlocked/search?name=test")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send()
    .expect(403);
})

it("Can search for locked companies", async ()=>{
  await request(app)
    .get("/companies/locked/search?name=test")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send()
    .expect(200);
})

it("Can search for unlocked companies", async ()=>{
  await request(app)
    .get("/companies/unlocked/search?name=test")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send()
    .expect(200);
})

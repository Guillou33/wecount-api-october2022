import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";
import { testString } from '@service/utils/tokenGenerator';
import { ROLES } from "@service/core/security/auth/config";
import { getManager } from "typeorm";
import { User } from "@root/entity";

let testFName = testString();
let testLName = testString();
const getUniqueEmail = () => {
  return testString() + "@email.com";
}

it("Can't get user full information if not logged in", async () => {
  await request(app)
    .get("/user-full")
    .send()
    .expect(403);
});

it("Can get user full information", async () => {
  await request(app)
    .get("/user-full")
    .set('Authorization', `Bearer ${getJwtUser()}`)
    .send()
    .expect(200);
});

it("Can't create a user not manager", async () => {
  await request(app)
    .post("/manager/user")
    .set('Authorization', `Bearer ${getJwtUser()}`)
    .send({
      firstName: testFName,
      lastName: testLName,
      email: getUniqueEmail(),
    })
    .expect(403);
});

it("Can create a user", async () => {
  await request(app)
    .post("/user-list")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_MANAGER]})}`)
    .send({
      firstName: testFName,
      lastName: testLName,
      email: getUniqueEmail(),
    })
    .expect(201);
});

it("Can get users", async () => {
  await request(app)
    .post("/user-list")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_MANAGER]})}`)
    .send({
      firstName: testFName,
      lastName: testLName,
      email: getUniqueEmail(),
    })
    .expect(201);

  await request(app)
    .get("/user-list")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_MANAGER]})}`)
    .send()
    .expect(200)
    .then((res) => {
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
});

it("Can archive / unarchive a user", async () => {
  await request(app)
    .post("/user-list")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_MANAGER]})}`)
    .send({
      firstName: testFName,
      lastName: testLName,
      email: getUniqueEmail(),
    })
    .expect(201);

  const em = getManager();
  const user = await em.findOne(User);
  expect(user).toBeTruthy();
  if (!user) {
    throw new Error("No user in db");
  } 
  const userId = user.id;

  await request(app)
    .post(`/manager/user/${userId}/archive`)
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_MANAGER]})}`)
    .send()
    .expect(200);

  const userRefreshed = await em.findOne(User, userId);
  expect(userRefreshed?.archived).toBeTruthy();

  await request(app)
    .post(`/manager/user/${userId}/unarchive`)
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_MANAGER]})}`)
    .send()
    .expect(200);

  const userRefreshedUnarchived = await em.findOne(User, userId);
  expect(userRefreshedUnarchived?.archived).toBeFalsy();
});


it("Can update a user", async () => {
  await request(app)
    .post("/user-list")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_MANAGER]})}`)
    .send({
      firstName: testFName,
      lastName: testLName,
      email: getUniqueEmail(),
    })
    .expect(201);

  const em = getManager();
  const user = await em.findOne(User);
  expect(user).toBeTruthy();
  if (!user) {
    throw new Error("No user in db");
  } 
  const userId = user.id;

  const newFName = 'modified_' + testString();
  const newLName = 'modified_' + testString();
  await request(app)
    .put(`/manager/user/${userId}`)
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_MANAGER]})}`)
    .send({
      firstName: newFName,
      lastName: newLName,
    })
    .expect(200);

  const userUpdated = await em.findOne(User, userId, {
    join: {
      alias: "u",
      leftJoinAndSelect: {
        profile: "u.profile",
      }
    }
  });
  if (!userUpdated) {
    throw new Error("User has no name");
  } 

  expect(userUpdated.profile.firstName).toBe(newFName);
  expect(userUpdated.profile.lastName).toBe(newLName);
});


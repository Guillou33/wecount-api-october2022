import request from "supertest";
import { app } from "@root/app";
import { User } from '@entity/auth/User';
import { getManager } from 'typeorm';

it("Returns a 200 on reset password request", async () => {
  await request(app)
    .post("/auth/reset-password/send")
    .send({
      email: "thomas@weepulse.fr",
    })
    .expect(200);
});

it("Returns a 200 on reset password get with token", async () => {
  await request(app)
    .post("/auth/reset-password/send")
    .send({
      email: "thomas@weepulse.fr",
    })
    .expect(200);

  const user = await getManager().findOne(User, {
    email: 'thomas@weepulse.fr'
  });
  const resetToken = user?.resetPasswordToken;

  if (!resetToken) {
    throw new Error("No reset token");
  }

  await request(app)
    .get(`/auth/reset-password/reset/${resetToken}`)
    .send()
    .expect(200);
});

it("Returns a 200 on reset password with new password", async () => {
  await request(app)
    .post("/auth/reset-password/send")
    .send({
      email: "thomas@weepulse.fr",
    })
    .expect(200);

  const user = await getManager().findOne(User, {
    email: 'thomas@weepulse.fr'
  });

  const resetToken = user?.resetPasswordToken;

  if (!resetToken) {
    throw new Error("No reset token");
  }

  await request(app)
    .post(`/auth/reset-password/reset/${resetToken}`)
    .send({
      password: 'azertyuiop1A&'
    })
    .expect(200);
});

it("Returns a 400 on reset malformed password", async () => {
  await request(app)
    .post("/auth/reset-password/send")
    .send({
      email: "thomas@weepulse.fr",
    })
    .expect(200);

  const user = await getManager().findOne(User, {
    email: 'thomas@weepulse.fr'
  });

  const resetToken = user?.resetPasswordToken;

  if (!resetToken) {
    throw new Error("No reset token");
  }

  await request(app)
    .post(`/auth/reset-password/reset/${resetToken}`)
    .send({
      // No special char
      password: 'azertyuiop1A'
    })
    .expect(400);
});

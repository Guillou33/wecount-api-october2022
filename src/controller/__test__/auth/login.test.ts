import request from "supertest";
import { app } from "@root/app";

it("Returns a 200 on login", async () => {
  await request(app)
    .post("/auth/login")
    .send({
      email: "thomas@weepulse.fr",
      password: "azertyuiop1A&",
    })
    .expect(200);
});

it("Returns a 400 if incorrect email structure", async () => {
  await request(app)
    .post("/auth/login")
    .send({
      email: "thomasweepulse.fr",
      password: "azertyuiop1A&",
    })
    .expect(400)
    .then((res) => {
      expect(Array.isArray(res.body.errors)).toBeTruthy();
      expect(res.body.errors[0].field).toBe("email");
    });
});

it("Returns a 401 if wrong credentials", async () => {
  await request(app)
    .post("/auth/login")
    .send({
      email: "thomas@weepulse.fr",
      password: "azertyuiopZ1&",
    })
    .expect(401);
});

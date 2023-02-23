import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";
import { ROLES } from '@service/core/security/auth/config/index';
import { LOCALE } from "@root/entity/enum/Locale";


// Signup is unactivated.

// it("Returns a 201 on signup", async () => {
//   await request(app)
//     .post("/auth/signup")
//     .send({
//       email: "thomas+2@weepulse.fr",
//       password: "azertyuiop1A&",
//       profile: {
//         firstName: "Thomas",
//         lastName: "Dournet",
//       },
//       company: {
//         name: "WeePulse",
//       },
//     })
//     .expect(201);
// });

// it("Returns a 400 if email taken", async () => {
//   await request(app)
//     .post("/auth/signup")
//     .send({
//       email: "thomas+2@weepulse.fr",
//       password: "azertyuiop1A&",
//       profile: {
//         firstName: "Thomas",
//         lastName: "Dournet",
//       },
//       company: {
//         name: "WeePulse",
//       },
//     })
//     .expect(400)
//     .then((res) => {
//       expect(Array.isArray(res.body.errors)).toBeTruthy();
//       expect(res.body.errors[0].message).toBe("existing_email");
//     });
// });

// it("Returns a 400 if password too short", async () => {
//   await request(app)
//     .post("/auth/signup")
//     .send({
//       email: "thomas+3@weepulse.fr",
//       password: "azer",
//       profile: {
//         firstName: "Thomas",
//         lastName: "Dournet",
//       },
//       company: {
//         name: "WeePulse",
//       },
//     })
//     .expect(400)
//     .then((res) => {
//       expect(Array.isArray(res.body.errors)).toBeTruthy();
//       expect(res.body.errors[0].field).toBe("password");
//     });
// });

it("Returns a 403 on admin account creation if not admin", async () => {
  await request(app)
    .post("/admin/account-creation")
    .set('Authorization', `Bearer ${getJwtUser()}`)
    .send({
      email: "thomas+3@weepulse.fr",
      profile: {
        firstName: "Thomas",
        lastName: "Dournet",
      },
      company: {
        name: "WeePulse",
      },
    })
    .expect(403);
});

it("Returns a 201 on admin account creation", async () => {
  await request(app)
    .post("/admin/account-creation")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send({
      email: "thomas+3@weepulse.fr",
      profile: {
        firstName: "Thomas",
        lastName: "Dournet",
      },
      company: {
        name: "WeePulse",
      },
      locale: LOCALE.FR_FR,
    })
    .expect(201);
});

it("Returns a 400 if email taken", async () => {
  await request(app)
    .post("/admin/account-creation")
    .set('Authorization', `Bearer ${getJwtUser({roles: [ROLES.ROLE_ADMIN]})}`)
    .send({
      email: "thomas+3@weepulse.fr",
      profile: {
        firstName: "Thomas",
        lastName: "Dournet",
      },
      company: {
        name: "WeePulse",
      },
      locale: LOCALE.FR_FR,
    })
    .expect(400)
    .then((res) => {
      expect(Array.isArray(res.body.errors)).toBeTruthy();
      expect(res.body.errors[0].message).toBe("existing_email");
    });
});

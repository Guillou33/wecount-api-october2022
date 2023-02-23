import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";
import { testString } from "@service/utils/tokenGenerator";
import { getManager } from "typeorm";
import { ActivityCategory } from "@entity/index";
import { SCOPE } from "@entity/enum/Scope";
import { weepulseAdmin } from "@root/test/mock/users";

async function getTestCategory({ order = 0 } = {}): Promise<ActivityCategory> {
  const em = getManager();
  const category = em.create(ActivityCategory);
  category.nameContentCode = testString();
  category.scope = SCOPE.UPSTREAM;
  category.order = order;

  return em.save(category);
}

it("Can't update category preferences if not logged in", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/userPreferences/activityCategories")
    .send({
      perimeterId,
    })
    .expect(403);
});

it("Won't update on malformed requests", async () => {
  const noBodyRequest = request(app)
    .post("/userPreferences/activityCategories")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send();

  const noActivityCategoryIdRequest = request(app)
    .post("/userPreferences/activityCategories")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send([
      {
        order: 0,
        description: "",
      },
    ]);

  const orderNotNumber = request(app)
    .post("/userPreferences/activityCategories")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send([
      {
        order: "bad",
        description: "",
      },
    ]);

  const descriptionNotString = request(app)
    .post("/userPreferences/activityCategories")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .send([
      {
        order: 0,
        description: 42,
      },
    ]);

  const responses = await Promise.all([
    noBodyRequest,
    noActivityCategoryIdRequest,
    orderNotNumber,
    descriptionNotString,
  ]);

  const statuses = responses.map(res => res.status);

  expect(statuses).toEqual([400, 400, 400, 400]);
});

it("Can create a setting", async () => {
  const testDescription = testString();
  const testCategory = await getTestCategory();
  const perimeterId = 1;

  await request(app)
    .post("/userPreferences/activityCategories")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      perimeterId,
      categorySettings: [
        {
          activityCategoryId: testCategory.id,
          order: 12,
          description: testDescription,
        },
      ],
    })
    .expect(200);

  const res = await request(app)
    .get(`/perimeters/${perimeterId}/cartographySettings`)
    .set("Authorization", `Bearer ${getJwtUser()}`);

  expect(res.body.categorySettings).toEqual(
    expect.arrayContaining([
      {
        activityCategoryId: testCategory.id,
        order: 12,
        description: testDescription,
      },
    ])
  );
});

it("Can update a setting", async () => {
  const testDescription = testString();
  const testDescriptionUpdated = testString();
  const testCategory = await getTestCategory();
  const perimeterId = 1;

  await request(app)
    .post("/userPreferences/activityCategories")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      categorySettings: [
        {
          activityCategoryId: testCategory.id,
          order: 12,
          description: testDescription,
        },
      ],
      perimeterId,
    });

  await request(app)
    .post("/userPreferences/activityCategories")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      categorySettings: [
        {
          activityCategoryId: testCategory.id,
          order: 42,
          description: testDescriptionUpdated,
        },
      ],
      perimeterId,
    });

  const res = await request(app)
    .get(`/perimeters/${perimeterId}/cartographySettings`)
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`);

  expect(res.body.categorySettings).toEqual(
    expect.arrayContaining([
      {
        activityCategoryId: testCategory.id,
        order: 42,
        description: testDescriptionUpdated,
      },
    ])
  );
});

it("Get the default order after updating the description only", async () => {
  const defaultOrder = 120;
  const testCategory = await getTestCategory({ order: defaultOrder });
  const testDescription = testString();
  const perimeterId = 1;

  await request(app)
    .post("/userPreferences/activityCategories")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      categorySettings: [
        {
          activityCategoryId: testCategory.id,
          description: testDescription,
        },
      ],
      perimeterId,
    });

  const res = await request(app)
    .get(`/perimeters/${perimeterId}/cartographySettings`)
    .set("Authorization", `Bearer ${getJwtUser()}`);

  expect(res.body.categorySettings).toEqual(
    expect.arrayContaining([
      {
        activityCategoryId: testCategory.id,
        description: testDescription,
        order: defaultOrder,
      },
    ])
  );
});

it("Can update several category preferences at once", async () => {
  const [testCategory1, testCategory2] = await Promise.all([
    getTestCategory(),
    getTestCategory(),
  ]);
  const perimeterId = await 1;

  const testDescription1 = testString();
  const testDescription2 = testString();

  const testOrder1 = 13;
  const testOrder2 = 15;

  await request(app)
    .post("/userPreferences/activityCategories")
    .set("Authorization", `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      categorySettings: [
        {
          activityCategoryId: testCategory1.id,
          description: testDescription1,
          order: testOrder1,
        },
        {
          activityCategoryId: testCategory2.id,
          description: testDescription2,
          order: testOrder2,
        },
      ],
      perimeterId,
    });

  const res = await request(app)
    .get(`/perimeters/${perimeterId}/cartographySettings`)
    .set("Authorization", `Bearer ${getJwtUser()}`);

  expect(res.body.categorySettings).toEqual(
    expect.arrayContaining([
      {
        activityCategoryId: testCategory1.id,
        description: testDescription1,
        order: testOrder1,
      },
      {
        activityCategoryId: testCategory2.id,
        description: testDescription2,
        order: testOrder2,
      },
    ])
  );
});

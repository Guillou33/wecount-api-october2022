import request from "supertest";
import { app } from "@root/app";
import { testString } from '@service/utils/tokenGenerator';
import { getManager } from 'typeorm';
import { Product } from "@entity/index";
import { getJwtUser } from "@root/test/utils/utils";
import { weepulseAdmin } from "@root/test/mock/users";

let testName = testString();
let testDescription = testString();

it("Can't get a product if not logged in", async () => {
  await request(app)
    .get("/products")
    .send()
    .expect(403);
});

it("Can create a product", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/products")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      description: testDescription,
      quantity: 3,
      perimeterId,
    })
    .expect(201);
});

it("Can get products", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/products")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      description: testDescription,
      quantity: null,
      perimeterId,
    })
    .expect(201);

  await request(app)
    .get(`/products`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200)
    .then((res) => {
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
});

it("Can archive / unarchive a product", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/products")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      description: testDescription,
      quantity: 3,
      perimeterId,
    })
    .expect(201);

  const em = getManager();
  const product = await em.findOne(Product, { order: { createdAt: "DESC" } });
  expect(product).toBeTruthy();
  if (!product) {
    throw new Error("No product in db");
  } 
  const productId = product.id;

  await request(app)
    .post(`/products/${productId}/archive`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  const productRefreshed = await em.findOne(Product, productId);
  expect(productRefreshed!.archivedDate).toBeTruthy();

  await request(app)
    .post(`/products/${productId}/unarchive`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send()
    .expect(200);

  const productRefreshedUnarchived = await em.findOne(Product, productId);
  expect(productRefreshedUnarchived!.archivedDate).toBeFalsy();
});


it("Can update a product", async () => {
  const perimeterId = 1;

  await request(app)
    .post("/products")
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: testName,
      description: testDescription,
      quantity: 2,
      perimeterId,
    })
    .expect(201);

  const em = getManager();
  const product = await em.findOne(Product, { order: { createdAt: "DESC" } });
  expect(product).toBeTruthy();
  if (!product) {
    throw new Error("No product in db");
  } 
  const productId = product.id;

  const newName = 'modified_' + testString();
  const newDescription = 'modified_' + testString();
  const newQuantity = 1000;
  await request(app)
    .put(`/products/${productId}`)
    .set('Authorization', `Bearer ${getJwtUser(weepulseAdmin)}`)
    .send({
      name: newName,
      description: newDescription,
      quantity: newQuantity
    })
    .expect(200);

  const productUpdated = await em.findOne(Product, productId);
  if (!productUpdated) {
    throw new Error("Product has no name");
  } 

  expect(productUpdated.name).toBe(newName);
  expect(productUpdated.description).toBe(newDescription);
  expect(productUpdated.quantity).toBe(newQuantity);
});

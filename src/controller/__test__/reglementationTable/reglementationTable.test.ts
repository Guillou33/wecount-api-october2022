import request from "supertest";
import { app } from "@root/app";
import { getJwtUser } from "@root/test/utils/utils";

it("Can get reglementation tables", async () => {
  await request(app)
    .get("/reglementation-tables/structure")
    .set("Authorization", `Bearer ${getJwtUser()}`)
    .expect(200);
});

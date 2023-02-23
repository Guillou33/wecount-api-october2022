import express, { Request, Response, NextFunction } from "express";
import cors from 'cors';
import "express-async-errors";
import bodyParser from "body-parser";
import { AppRouter } from "@deep/routing/AppRouter";
import authenticationMiddleware from "@service/core/security/auth/authenticationMiddleware";
import aclAuthorizationMiddleware from "@service/core/security/auth/aclAuthorizationMiddleware";
import "@controller/index";
import "@event/subscriber/index";
import responseErrorHandler from "@service/core/error/middleware/responseErrorHandler";
import NotFoundError from "@deep/responseError/NotFoundError";
import * as Sentry from "@sentry/node";
import { sentryInit } from "@service/core/error/sentry/sentryInit";
import mixpanel from "@service/core/analytics/mixpanel";

const app = express();

app.use(cors());
sentryInit(app);
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(bodyParser.json());
app.use(authenticationMiddleware);
app.use(aclAuthorizationMiddleware);
app.use(AppRouter.getInstance());

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.all("*", async (req: Request, res: Response) => {
  throw new NotFoundError();
});

app.use(responseErrorHandler);

app.use(Sentry.Handlers.errorHandler());
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log('500 Error : ', err);
  res.status(500).send({
    errors: [{ message: "Something went wrong" }],
  });
});

export { app };
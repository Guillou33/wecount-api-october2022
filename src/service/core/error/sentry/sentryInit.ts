import config from "config";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { Express } from "express";

const sentryConfig: any = config.get('sentry');

export const sentryInit = (app: Express) => {
  Sentry.init({
    dsn: sentryConfig.dsn,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: sentryConfig.tracing }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
  
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: sentryConfig.tracesSampleRate,
  });
}

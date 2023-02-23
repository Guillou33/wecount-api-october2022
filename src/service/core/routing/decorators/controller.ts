import { Request, Response, RequestHandler, NextFunction } from "express";
import { AppRouter } from "../AppRouter";
import { Methods } from "./Methods";
import { MetadataKeys } from "./MetadataKeys";
import { runInThisContext } from "vm";

function bodyValidators(keys: string): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
      res.status(422).send("Invalid request");
      return;
    }

    for (let key of keys) {
      if (!req.body[key]) {
        res.status(422).send(`Missing property ${key}`);
        return;
      }
    }

    next();
  };
}

// Used to catch errors on Async functions.
// When using an async RequestHandler, add @asyncHandle decorator to fire up this function
const asyncMiddleware = function (middleware: RequestHandler) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(middleware(req, res, next)).catch(next);
  };
};

export function controller(routePrefix: string) {
  return function (target: Function) {
    const router = AppRouter.getInstance();

    function construct(constructor: any, args: []) {
      const c: any = function () {
        return constructor.apply(this, args);
      };
      c.prototype = constructor.prototype;
      return new c();
    }

    const instance = construct(target, []);

    for (let key in target.prototype) {
      let routeHandler = instance[key].bind(instance);
      const path =
        Reflect.getMetadata(MetadataKeys.path, target.prototype, key) || "";
      const method: Methods = Reflect.getMetadata(
        MetadataKeys.method,
        target.prototype,
        key
      );
      const middlewaresReversed =
        Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) ||
        [];
      const middlewares = middlewaresReversed.reverse();

      const requiredBodyProps =
        Reflect.getMetadata(MetadataKeys.validator, target.prototype, key) ||
        [];

      const asyncHandle =
        Reflect.getMetadata(MetadataKeys.asyncHandle, target.prototype, key) ||
        false;

      const validator = bodyValidators(requiredBodyProps);

      if (asyncHandle) {
        routeHandler = asyncMiddleware(routeHandler);
      }

      const fullPath = `${routePrefix}${path}`;
      
      if (fullPath && method) {
        router[method](
          fullPath,
          ...middlewares,
          validator,
          routeHandler
        );
      }
    }
  };
}

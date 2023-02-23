import 'reflect-metadata';
import { RequestHandler } from 'express';
import { MetadataKeys } from './MetadataKeys';

export function use(middleware: RequestHandler | RequestHandler[]) {
  return function(target: any, key: string, desc: PropertyDescriptor) {
    const existingMiddlewares =
      Reflect.getMetadata(MetadataKeys.middleware, target, key) || [];

      // console.log(middleware instanceof Array ? middleware.length : 'not array');
      

    const currentMiddlewaresArray = (middleware instanceof Array) ? middleware.reverse() : [middleware];

    Reflect.defineMetadata(
      MetadataKeys.middleware,
      [...existingMiddlewares, ...currentMiddlewaresArray],
      target,
      key
    );
  };
}

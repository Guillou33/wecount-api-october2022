import 'reflect-metadata';
import { MetadataKeys } from './MetadataKeys';

export function asyncHandle(target: any, key: string, desc: PropertyDescriptor) {
  Reflect.defineMetadata(
    MetadataKeys.asyncHandle,
    true,
    target,
    key
  );
};

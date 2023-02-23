import config from "config";
import { ROLES } from '@service/core/security/auth/config/index';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { LOCALE } from "@root/entity/enum/Locale";

const jwtConfig: any = config.get('jwt');

const PRIVATE_KEY_PATH: string = jwtConfig.privateKeyPath;
const PRIVATE_KEY_PASSPHRASE: string = jwtConfig.privateKeyPassphrase;
const EXPIRATION_IN_SECONDS: number = jwtConfig.expirationInSeconds;

export default class MockTokenHandler {
  static create(user: {id: number; email: string; roles: ROLES[]; locale?: LOCALE}): string {
    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH);
    const tokenObject: any = { 
      id: user.id,
      email: user.email,
      roles: user.roles,
      exp: Math.floor(Date.now() / 1000) + EXPIRATION_IN_SECONDS,
    };
    if (user.locale) {
      tokenObject.locale = user.locale;
    }
    const token = jwt.sign(tokenObject, {key: privateKey, passphrase: PRIVATE_KEY_PASSPHRASE}, { algorithm: 'RS256'});

    return token;
  }
}

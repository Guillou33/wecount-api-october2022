import config from "config";
import { User } from '@entity/auth/User';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const jwtConfig: any = config.get('jwt');

const PRIVATE_KEY_PATH: string = jwtConfig.privateKeyPath;
const PRIVATE_KEY_PASSPHRASE: string = jwtConfig.privateKeyPassphrase;
const EXPIRATION_IN_SECONDS: number = jwtConfig.expirationInSeconds;

export default class TokenHandler {
  static create(user: User, isImpersonation: boolean = false): string {
    if (!user.id) {
      throw new Error("User is not saved in DB");
    }

    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH);
    const token = jwt.sign({ 
      id: user.id,
      email: user.email,
      roles: user.getRoles(),
      locale: user.locale,
      isImpersonation,
      exp: Math.floor(Date.now() / 1000) + EXPIRATION_IN_SECONDS,
    }, {key: privateKey, passphrase: PRIVATE_KEY_PASSPHRASE}, { algorithm: 'RS256'});

    return token;
  }
}

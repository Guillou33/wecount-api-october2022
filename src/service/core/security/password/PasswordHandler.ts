import bcrypt from 'bcrypt';
import passwordValidator from 'password-validator';

const SALT_ROUNDS_NB = 10;

export default class PasswordHandler {
  static securityLevelAccepted(password: string): boolean {
    const pwdSchema = new passwordValidator();
    pwdSchema
      .is().min(8)
      .is().max(100)
      .has().uppercase()
      .has().digits(1)
      .has().not().spaces()
      .has().symbols(1);

    return pwdSchema.validate(password) as boolean;
  }

  static hash(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, SALT_ROUNDS_NB, function(err, hash) {
        resolve(hash);
      });
    });
  }

  static isValid(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, function(err, result) {
        resolve(result);
      });
    });
  }
}

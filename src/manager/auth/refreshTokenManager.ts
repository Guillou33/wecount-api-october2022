import { RefreshToken, User } from '@entity/index';
import { uid } from 'rand-token';
import { RefreshTokenRepository } from '@repository/index';
import AbstractManagerWithRepository from '@root/manager/AbstractManagerWithRepository';

class RefreshTokenManager extends AbstractManagerWithRepository<RefreshToken, RefreshTokenRepository> {
  protected entityClass = RefreshToken;
  protected repositoryClass = RefreshTokenRepository;

  async createNew(user: User, flush: boolean = false): Promise<RefreshToken> {
    const refreshToken = this.instance();

    refreshToken.token = uid(32);
    refreshToken.user = user;
    refreshToken.expirationDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    if (flush) {
      await this.em.save(refreshToken)
    }

    return refreshToken;
  }
}

export default new RefreshTokenManager();

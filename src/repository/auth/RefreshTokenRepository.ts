import { RefreshToken, User } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends Repository<RefreshToken> {

  async findLastForUser(user: User, withUser: boolean = false): Promise<RefreshToken | undefined> {
    
    const queryBuilder = this.createQueryBuilder("r")
      .where("r.user_id = :userId", { userId: user.id })
      .orderBy("r.created_at", "DESC");
    if (withUser) {
      queryBuilder.leftJoinAndSelect("r.user", "user");
    }

    const refreshToken = await queryBuilder.getOne();

    return refreshToken;
  }
}

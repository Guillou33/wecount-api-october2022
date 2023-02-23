import { User, Company } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  async findUsersForCompany(company: Company, withProfile: boolean = false): Promise<User[]> {
    
    const queryBuilder = this.createQueryBuilder("u")
      .where("u.company_id = :companyId", { companyId: company.id })
      .orderBy("u.created_at", "ASC");
    if (withProfile) {
      queryBuilder.leftJoinAndSelect("u.profile", "profile");
    }

    const users = await queryBuilder.getMany();

    return users;
  }
}

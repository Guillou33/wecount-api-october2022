import { CustomEmissionFactor, User, UserRoleWithinPerimeter } from "@entity/index";
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";

@EntityRepository(CustomEmissionFactor)
export class CustomEmissionFactorRepository extends Repository<CustomEmissionFactor> {
  async findAll(params: {
    isManager: boolean;
    user: User;
    searchTerm?: string;
  }): Promise<CustomEmissionFactor[]> {
    const queryBuilder = params.isManager ? this.createStartQueryForManager(params.user) : this.createStartQueryForUser(params.user);
    
    if (params?.searchTerm) {
      queryBuilder.andWhere("c.name LIKE :searchTerm", { searchTerm: `%${params.searchTerm}%` });
    }
    queryBuilder.orderBy("c.createdAt", "DESC")
      .limit(30);

    const customEmissionFactors = await queryBuilder.getMany();
    return customEmissionFactors;
  }

  private createStartQueryForUser(user: User): SelectQueryBuilder<CustomEmissionFactor> {
    return this.createQueryBuilder("c")
      .innerJoin("c.perimeter", "p")
      .innerJoin(
        UserRoleWithinPerimeter,
        "urwp",
        "urwp.perimeter_id=p.id"
      ).innerJoin(User, "u", "u.id = urwp.user_id AND u.id = :userId", {
        userId: user.id,
      });
  }

  private createStartQueryForManager(user: User): SelectQueryBuilder<CustomEmissionFactor> {
    return this.createQueryBuilder("c")
      .innerJoin("c.perimeter", "p")
      .innerJoin("p.company", "company")
      .innerJoin(User, "u", "u.company_id = company.id AND u.id = :userId", {
        userId: user.id,
      });
  }
}

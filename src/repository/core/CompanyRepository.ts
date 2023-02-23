import { Company } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";
import { User } from "@entity/index";

@EntityRepository(Company)
export class CompanyRepository extends Repository<Company> {

  async findByUser(user: User): Promise<Company | undefined> {
    
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoin(User, "u", "u.company_id = c.id AND u.id = :userId", { userId: user.id });

    const company = await queryBuilder.getOne();

    return company;
  }

  async findWithUserPaginated({
    offset,
    length,
    locked = false,
  }: {
    offset: number;
    length: number;
    locked?: boolean;
  }): Promise<Company[]> {
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoinAndSelect("c.users", "users")
      .andWhere(locked ? "c.lockedDate IS NOT NULL" : "c.lockedDate IS NULL")
      .addOrderBy("c.name")
      .skip(offset)
      .take(length);

    const companies = await queryBuilder.getMany();

    return companies;
  }

  async findByName({
    name,
    locked = false,
  }: {
    name: string;
    locked?: boolean;
  }): Promise<Company[]> {
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoinAndSelect("c.users", "users")
      .andWhere(locked ? "c.lockedDate IS NOT NULL" : "c.lockedDate IS NULL")
      .andWhere("c.name LIKE :name", { name: `%${name}%` })
      .addOrderBy("c.name");

    return queryBuilder.getMany();
  }

}

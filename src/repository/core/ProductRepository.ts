import { Product, UserRoleWithinPerimeter } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";
import { User } from "@entity/index";

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
  async findAllForUser(user: User): Promise<Product[]> {
    const queryBuilder = this.createQueryBuilder("pdct")
      .innerJoin("pdct.perimeter", "perimeter")
      .innerJoin(
        UserRoleWithinPerimeter,
        "urwp",
        "urwp.perimeter_id=perimeter.id"
      )
      .innerJoin(User, "u", "u.id = urwp.user_id AND u.id = :userId", {
        userId: user.id,
      });

    return queryBuilder.getMany();
  }

  async findAllForManager(user: User): Promise<Product[]> {
    const queryBuilder = this.createQueryBuilder("pdct")
      .innerJoin("pdct.perimeter", "p")
      .innerJoin("p.company", "company")
      .innerJoin(User, "u", "u.company_id = company.id AND u.id = :userId", {
        userId: user.id,
      });

    return queryBuilder.getMany();
  }
}

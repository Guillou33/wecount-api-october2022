import { EntryTag, UserRoleWithinPerimeter } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";
import { User } from "@entity/index";

@EntityRepository(EntryTag)
export class EntryTagRepository extends Repository<EntryTag> {
  async findAllForManager(user: User): Promise<EntryTag[]> {
    const queryBuilder = this.createQueryBuilder("et")
      .innerJoin("et.perimeter", "p")
      .innerJoin("p.company", "company")
      .innerJoin(User, "u", "u.company_id = company.id AND u.id = :userId", {
        userId: user.id,
      });

    const entryTags = await queryBuilder.getMany();

    return entryTags;
  }

  async findAllForUser(user: User): Promise<EntryTag[]> {
    const queryBuilder = this.createQueryBuilder("et")
      .innerJoin("et.perimeter", "perimeter")
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
}
import { User, EntryTag } from "@entity/index";
import { getManager } from "typeorm";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";

const validateEntryTag = async (
  id: number,
  userWithCompany: User
): Promise<EntryTag> => {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const em = getManager();

  const entryTag = await em.findOne(EntryTag, id, {
    join: {
      alias: "et",
      innerJoinAndSelect: {
        perimeter: "et.perimeter",
        company: "perimeter.company",
      },
    },
  });

  if (!entryTag) {
    throw new NotFoundError();
  }

  if (userWithCompany.company.id !== entryTag.perimeter.company.id) {
    throw new AccessDeniedError();
  }

  return entryTag;
};

export { validateEntryTag };
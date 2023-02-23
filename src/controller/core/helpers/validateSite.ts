import { User, Site } from "@entity/index";
import { getManager } from "typeorm";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";

const validateSite = async (
  id: number,
  userWithCompany: User
): Promise<Site> => {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const em = getManager();

  const site = await em.findOne(Site, id, {
    join: {
      alias: "s",
      innerJoinAndSelect: {
        perimeter: "s.perimeter",
        company: "perimeter.company",
      },
    },
  });

  if (!site) {
    throw new NotFoundError();
  }

  if (userWithCompany.company.id !== site.perimeter.company.id) {
    throw new AccessDeniedError();
  }

  return site;
};

export { validateSite };
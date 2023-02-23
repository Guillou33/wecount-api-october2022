import { User, Perimeter } from "@entity/index";
import { getManager } from "typeorm";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";

async function validatePerimeter(
  perimeterId: number,
  userWithCompany: User
): Promise<Perimeter> {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const em = getManager();
  const perimeter = await em.findOne(Perimeter, perimeterId, {
    join: {
      alias: "p",
      innerJoinAndSelect: {
        company: "p.company"
      }
    }
  });
  
  if (!perimeter) {
    throw new NotFoundError();
  }

  if (perimeter.company.id !== userWithCompany.company.id) {
    throw new AccessDeniedError();
  }

  return perimeter;
}

export { validatePerimeter };

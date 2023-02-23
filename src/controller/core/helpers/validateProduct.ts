import { User, Product } from "@entity/index";
import { getManager } from "typeorm";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";

const validateProduct = async (
  id: number,
  userWithCompany: User
): Promise<Product> => {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const em = getManager();

  const product = await em.findOne(Product, id, {
    join: {
      alias: "p",
      innerJoinAndSelect: {
        perimeter: "p.perimeter",
        company: "perimeter.company",
      },
    },
  });

  if (!product) {
    throw new NotFoundError();
  }

  if (userWithCompany.company.id !== product.perimeter.company.id) {
    throw new AccessDeniedError();
  }

  return product;
};

export { validateProduct };
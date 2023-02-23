import { User, Campaign, UserRoleWithinPerimeter } from "@entity/index";
import { getManager } from "typeorm";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";

const validateCampaign = async (
  id: number,
  userWithCompany: User
): Promise<Campaign> => {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const em = getManager();

  const campaign = await em.findOne(Campaign, id, {
    join: {
      alias: "c",
      innerJoinAndSelect: {
        perimeter: "c.perimeter",
        company: "perimeter.company",
      },
    },
  });

  if (!campaign) {
    throw new NotFoundError();
  }

  if (userWithCompany.company.id !== campaign.perimeter.company.id) {
    throw new AccessDeniedError();
  }

  return campaign;
};

export { validateCampaign };

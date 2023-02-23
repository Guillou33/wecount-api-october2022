import { User, Indicator } from "@entity/index";
import { getManager } from "typeorm";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";
import { IndicatorRepository } from "@root/repository";
import { LOCALE } from "@root/entity/enum/Locale";

const validateIndicator = async (
  id: number,
  userWithCompany: User,
): Promise<Indicator> => {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const em = getManager();
  const indicatorRepository = em.getCustomRepository(IndicatorRepository);

  const indicator = await indicatorRepository.findOneWithMainRelations(id, userWithCompany.locale ?? undefined);

  if (!indicator) {
    throw new NotFoundError();
  }

  if (userWithCompany.company.id !== indicator.campaign.perimeter.company.id) {
    throw new AccessDeniedError();
  }

  return indicator;
};

export { validateIndicator };

import { EmissionFactor, EmissionFactorInfo } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(EmissionFactorInfo)
export class EmissionFactorInfoRepository extends Repository<EmissionFactorInfo> {
  async findOneByEfId(efId: number): Promise<EmissionFactorInfo | undefined> {
    const queryBuilder = this.createQueryBuilder("efi")
      .innerJoin(EmissionFactor, "ef", "ef.emission_factor_info_id = efi.id")
      .where("ef.id = :efId", {efId});

    const efi = await queryBuilder.getOne();

    return efi;
  }
}

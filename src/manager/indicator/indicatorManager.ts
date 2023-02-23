import { Indicator, Campaign } from "@entity/index";
import AbstractManager from "@manager/AbstractManager";
import { IndicatorRepository } from "@root/repository";
import { contentManager } from "..";
import AbstractManagerWithRepository from "../AbstractManagerWithRepository";

type IndicatorInfo = {
  name: string;
  unit: string | null;
  quantity: number | null;
};

type IndicatorInfoWithCampaign = IndicatorInfo & {
  campaign: Campaign;
};

class IndicatorManager extends AbstractManagerWithRepository<Indicator, IndicatorRepository> {
  protected entityClass = Indicator;
  protected repositoryClass = IndicatorRepository;

  async createNew(
    indicatorInfo: IndicatorInfoWithCampaign
  ): Promise<Indicator> {
    const indicator = this.instanceFromData({
      ...indicatorInfo,
    });

    return this.em.save(indicator);
  }

  async delete(indicator: Indicator): Promise<Indicator> {
    return this.em.softRemove(indicator);
  }

  async update(
    indicator: Indicator,
    updateInfo: IndicatorInfo
  ): Promise<Indicator> {
    indicator.name = updateInfo.name;
    indicator.quantity = updateInfo.quantity;
    indicator.unit = updateInfo.unit;
    return this.em.save(indicator);
  }

  async findAllForCampaign(campaign: Campaign): Promise<Indicator[]> {
    return this.em.find(Indicator, { campaign: campaign });
  }
}

export default new IndicatorManager();

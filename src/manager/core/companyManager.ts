import { Company } from "@entity/index";
import AbstractManager from "@manager/AbstractManager";

class CompanyManager extends AbstractManager<Company> {
  protected entityClass = Company;

  async createNew(
    companyInfo: { name: string },
    flush: boolean = false
  ): Promise<Company> {
    const company = this.instance();
    company.name = companyInfo.name;

    if (flush) {
      await this.em.save(company);
    }

    return company;
  }

  async lock(company: Company, flush: boolean = false): Promise<Company> {
    this.em.merge(Company, company, {
      lockedDate: new Date(),
    });

    if (flush) {
      await this.em.save(company);
    }

    return company;
  }

  async unlock(company: Company, flush: boolean = false): Promise<Company> {
    this.em.merge(Company, company, {
      lockedDate: null,
    });

    if (flush) {
      await this.em.save(company);
    }

    return company;
  }

  async setReadOnlyMode(
    company: Company,
    readonlyMode: boolean,
    flush: boolean = false
  ): Promise<Company> {
    this.em.merge(Company, company, {
      readonlyMode,
    });
    if (flush) {
      await this.em.save(company);
    }

    return company;
  }
}

export default new CompanyManager();

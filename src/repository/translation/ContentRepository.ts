import { EntityRepository, Repository } from "typeorm";
import { Content } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";

@EntityRepository(Content)
export class ContentRepository extends Repository<Content> {
  async removeContentByCode(code: string | null) {
    if (code === null) {
      return;
    }
    
    const queryBuilder = this.createQueryBuilder("content")
      .andWhere("content.code = :code", {code});
    
    const contents = await queryBuilder.getMany();

    await this.remove(contents);
  }

  async removeContentByCodes(codes: (string | null)[]) {
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      await this.removeContentByCode(code);
    }
  }

  async findTextByCode(code: (string | null), customLocale?: LOCALE): Promise<string | null> {
    if (code === null) {
      return null;
    }
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("c")
      .andWhere("c.code = :code", {code})
      .andWhere("c.locale = :locale", {locale});
    
    const content = await queryBuilder.getOne();

    return content?.text ?? null;
  }
}

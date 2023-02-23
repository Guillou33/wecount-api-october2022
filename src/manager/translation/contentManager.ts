import { Content } from "@entity/index";
import AbstractManager from "@manager/AbstractManager";
import { LOCALE } from "@root/entity/enum/Locale";
import { ContentRepository } from "@root/repository";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { randomUpperToken } from "@root/service/utils/tokenGenerator";
import AbstractManagerWithRepository from "../AbstractManagerWithRepository";

class ContentManager extends AbstractManagerWithRepository<Content, ContentRepository> {
  protected entityClass = Content;
  protected repositoryClass = ContentRepository;

  async addTranslation(
    contentInfo: {
      code: string;
      text: string;
      locale: LOCALE;
      translationMissing?: boolean;
    },
    flush: boolean = false
  ): Promise<Content> {
    const content = this.instance();

    content.code = contentInfo.code;
    content.locale = contentInfo.locale;
    content.text = contentInfo.text;
    if (contentInfo.translationMissing) {
      content.translationMissing = true;
    }

    if (flush) {
      await this.em.save(content);
    }

    return content;
  }
  
  async createNew(
    contentInfo: {
      prefix: string;
      text: string;
      locale?: LOCALE;
    },
    flush: boolean = false
  ): Promise<Content> {
    const content = this.instance();
    const code = `${contentInfo.prefix}_${randomUpperToken(5)}`;

    content.code = code;
    content.text = contentInfo.text;
    content.locale = contentInfo.locale ?? fallbackLocale;

    if (flush) {
      await this.em.save(content);
    }

    return content;
  }

  async createAndGetNullableContentCode(
    contentInfo: {
      prefix: string;
      text?: string | null;
      locale?: LOCALE;
    }
  ): Promise<string | null> {
    if (typeof contentInfo.text === 'undefined' || contentInfo.text === null) {
      return null;
    }
    const content = await this.createNew({
      prefix: contentInfo.prefix,
      text: contentInfo.text,
      locale: contentInfo.locale
    }, true);

    return content.code;
  }

  async createAndGetContentCode(
    contentInfo: {
      prefix: string;
      text: string;
      locale?: LOCALE;
    }
  ): Promise<string> {
    const contentCode = await this.createAndGetNullableContentCode({
      prefix: contentInfo.prefix,
      text: contentInfo.text,
      locale: contentInfo.locale,
    });

    return contentCode as string;
  }

  async createFromIngestor(
    contentInfo: {
      code: string;
      text: string;
      locale: LOCALE;
      translationMissing?: boolean;
    },
    flush: boolean = false
  ): Promise<Content> {
    const content = this.instance();

    content.code = contentInfo.code;
    content.text = contentInfo.text;
    content.locale = contentInfo.locale;
    content.translationMissing = contentInfo.translationMissing ?? false;

    if (flush) {
      await this.em.save(content);
    }

    return content;
  }

  async createFromContentCode(contentInfo: {
    code: string,
    text: string | null,
    locale?: LOCALE,
  }):Promise<Content | null> {
    const { code, text, locale = fallbackLocale } = contentInfo;
    if(text == null){
      return null;
    }

    const content = this.instance();
    content.code = code;
    content.text = text;
    content.locale = locale;

    return this.em.save(content);
  }
}

export default new ContentManager();

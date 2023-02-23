import { Content } from "@root/entity";
import { LOCALE } from "@root/entity/enum/Locale";
import { contentManager } from "@root/manager";
import { getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  CONTENT_CODE = 3,
  LOCALE = 4,
  TEXT = 5,
}

export default class Modificator extends AbstractBaseIngestor {

  private contentRepository;
  private em;
  private batchesToSend: Content[] = [];

  constructor(csvPath: string) {
    super(csvPath);

    this.contentRepository = contentManager.getRepository();
    this.em = getManager();
  }

  protected csvLength = 3
  protected formatCsvTypes(value: string, index: number) {
    return value;
  } 

  async ingest(): Promise<void> {
    console.log(this.csvParsed.length);

    const contents = await this.contentRepository.find();
    const contentMap = contents.reduce<{[key: string]: Content}>((contentMap, content) => {
      contentMap[`${content.code}_${content.locale}`] = content;
      return contentMap;
    }, {});

    for (let i = 0; i < this.csvParsed.length; i++) {
      console.log(i);

      const line = this.csvParsed[i];
      this.checkLength(line);

      const existingContent = contentMap[`${line[CsvLine.CONTENT_CODE]}_${line[CsvLine.LOCALE]}`];

      if (existingContent) {
        await this.modifyContent(line, existingContent);
        console.log(`Modified ${line[CsvLine.CONTENT_CODE]}`);
      } else {
        if (line[CsvLine.TEXT] && Object.values(LOCALE).includes(line[CsvLine.LOCALE])) {
          await this.createContent(line);
        }
        console.log(`Created ${line[CsvLine.CONTENT_CODE]}`);
      }
    }
    await this.em.save(this.batchesToSend);

    console.log('END');
  }

  private async modifyContent(line: any, existingContent: Content) {
    if (line[CsvLine.TEXT] === "Nontraduit") {
      this.em.merge(Content, existingContent, {
        translationMissing: line[CsvLine.TEXT] === "Nontraduit",
      });
    } else {
      this.em.merge(Content, existingContent, {
        text: line[CsvLine.TEXT],
      });
    }
    await this.saveInBatch(existingContent);
  }

  private async createContent(line: any) {
    const content = await contentManager.createFromIngestor({
      code: line[CsvLine.CONTENT_CODE],
      locale: line[CsvLine.LOCALE],
      text: line[CsvLine.TEXT],
      translationMissing: line[CsvLine.TEXT] === "Nontraduit",
    });
    await this.saveInBatch(content);
  }

  private async saveInBatch(content: Content) {
    this.batchesToSend.push(content);
    if (this.batchesToSend.length >= 1000) {
      await this.em.save(this.batchesToSend);
      this.batchesToSend = [];
    }
  }
}

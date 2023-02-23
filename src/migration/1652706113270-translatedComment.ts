import { randomUpperToken } from "@root/service/utils/tokenGenerator";
import {MigrationInterface, QueryRunner} from "typeorm";

export class translatedComment1652706113270 implements MigrationInterface {
    name = 'translatedComment1652706113270'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("ALTER TABLE `emission_factor` ADD `comment_content_code` varchar(255) NULL");
      const emissionFactors = await queryRunner.query(`
        SELECT ef.id, efi.french_comment, efi.english_comment FROM emission_factor ef
        INNER JOIN emission_factor_info efi ON ef.emission_factor_info_id = efi.id
      `);
      for (let i = 0; i < emissionFactors.length; i++) {
        console.log(`${i} / ${emissionFactors.length}`);
        
        const ef = emissionFactors[i];
        const code = `${ef.id}_${randomUpperToken(5)}`;
        
        if (ef.french_comment && ef.french_comment !== 'null') {
          await queryRunner.query(`UPDATE emission_factor ef SET 
            comment_content_code = 'ef_comment_${code}'
            WHERE id = ${ef.id}`);
          await queryRunner.query(`INSERT INTO content (code, locale, text, translation_missing) VALUES ('ef_comment_${code}', 'fr-FR', "${ef.french_comment.replace(/"/g, '\\"')}", 0)`);
          if (ef.english_comment && ef.english_comment.toLowerCase() !== 'null') {
            await queryRunner.query(`INSERT INTO content (code, locale, text, translation_missing) VALUES ('ef_comment_${code}', 'en-GB', "${ef.english_comment.replace(/"/g, '\\"')}", 0)`);
          } else {
            await queryRunner.query(`INSERT INTO content (code, locale, text, translation_missing) VALUES ('ef_comment_${code}', 'en-GB', "${ef.french_comment.replace(/"/g, '\\"')}", 1)`);
          }
        }
      }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

import { randomUpperToken } from "@root/service/utils/tokenGenerator";
import {MigrationInterface, QueryRunner} from "typeorm";

export class translation1646040196153 implements MigrationInterface {
    name = 'translation1646040196153'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("ALTER TABLE `user` ADD `locale` enum ('fr-FR', 'en-GB') NULL");

      await queryRunner.query("CREATE TABLE `content` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `code` varchar(255) NOT NULL, `locale` enum ('fr-FR', 'en-GB') NOT NULL, `text` text NOT NULL, INDEX `IDX_f0942bef2a6bed470199804dbe` (`code`), UNIQUE INDEX `UniqueCodeLocale` (`code`, `locale`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
      
      // CM

      await queryRunner.query("ALTER TABLE `compute_method` ADD `name_content_code` varchar(255) NOT NULL");
      await queryRunner.query("ALTER TABLE `compute_method` ADD `description_content_code` varchar(255) NULL");
      await queryRunner.query("ALTER TABLE `compute_method` ADD `value_name_content_code` varchar(255) NOT NULL");
      await queryRunner.query("ALTER TABLE `compute_method` ADD `value2_name_content_code` varchar(255) NULL");
      await queryRunner.query("ALTER TABLE `compute_method` ADD `emission_factor_label_content_code` varchar(255) NULL");

      const computeMethods = await queryRunner.query(`
        SELECT cm.id, cm.name, cm.description, cm.value_name, cm.value2_name, cm.emission_factor_label FROM compute_method cm
      `);
      for (let i = 0; i < computeMethods.length; i++) {
        const cm = computeMethods[i];
        const code = `${cm.id}_${randomUpperToken(5)}`;
        
        await queryRunner.query(`UPDATE compute_method cm 
          SET name_content_code = 'cm_name_${code}', 
          description_content_code = (CASE WHEN description IS NULL THEN NULL ELSE 'cm_description_${code}' END), 
          value_name_content_code = 'cm_value_name_${code}', 
          value2_name_content_code = (CASE WHEN value2_name IS NULL THEN NULL ELSE 'cm_value2_name_${code}' END),
          emission_factor_label_content_code = (CASE WHEN emission_factor_label IS NULL THEN NULL ELSE 'cm_emission_factor_label_${code}' END) 
          WHERE id = ${cm.id}`);
        await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_name_${code}', 'fr-FR', "${cm.name}")`);
        await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_value_name_${code}', 'fr-FR', "${cm.value_name}")`);
        await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_name_${code}', 'en-GB', "TODOEN-${cm.name}")`);
        await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_value_name_${code}', 'en-GB', "TODOEN-${cm.value_name}")`);
        if (cm.description && cm.description !== 'null') {
          await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_description_${code}', 'fr-FR', "${cm.description}")`);
          await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_description_${code}', 'en-GB', "TODOEN-${cm.description}")`);
        }
        if (cm.value2_name && cm.value2_name !== 'null') {
          await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_value2_name_${code}', 'fr-FR', "${cm.value2_name}")`);
          await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_value2_name_${code}', 'en-GB', "TODOEN-${cm.value2_name}")`);
        }
        if (cm.emission_factor_label && cm.emission_factor_label !== 'null') {
          await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_emission_factor_label_${code}', 'fr-FR', "${cm.emission_factor_label}")`);
          await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('cm_emission_factor_label_${code}', 'en-GB', "TODOEN-${cm.emission_factor_label}")`);
        }
      }

      await queryRunner.query("ALTER TABLE `compute_method` DROP COLUMN `name`");
      await queryRunner.query("ALTER TABLE `compute_method` DROP COLUMN `description`");
      await queryRunner.query("ALTER TABLE `compute_method` DROP COLUMN `value2_name`");
      await queryRunner.query("ALTER TABLE `compute_method` DROP COLUMN `value_name`");
      await queryRunner.query("ALTER TABLE `compute_method` DROP COLUMN `emission_factor_label`");


      // EF

      await queryRunner.query("ALTER TABLE `emission_factor` ADD `name_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `emission_factor` ADD `description_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `emission_factor` ADD `source_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `emission_factor` ADD `unit_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `emission_factor` ADD `input1_unit_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `emission_factor` ADD `input2_unit_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `emission_factor` ADD `program_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `emission_factor` ADD `url_program_content_code` varchar(255)");

      const emissionFactors = await queryRunner.query(`
        SELECT ef.id, ef.name, ef.description, ef.source, ef.unit, ef.input1_unit, ef.input2_unit, ef.program, ef.url_program, efi.wecount_name_english, efi.english_unit FROM emission_factor ef
        INNER JOIN emission_factor_info efi ON ef.emission_factor_info_id = efi.id
      `);
      for (let i = 0; i < emissionFactors.length; i++) {
        const ef = emissionFactors[i];
        const code = `${ef.id}_${randomUpperToken(5)}`;
        
        await queryRunner.query(`UPDATE emission_factor ef SET 
        name_content_code = (CASE WHEN name IS NULL THEN NULL ELSE 'ef_name_${code}' END), 
        description_content_code = (CASE WHEN description IS NULL THEN NULL ELSE 'ef_description_${code}' END),
        source_content_code = (CASE WHEN source IS NULL THEN NULL ELSE 'ef_source_${code}' END),
        unit_content_code = (CASE WHEN unit IS NULL THEN NULL ELSE 'ef_unit_${code}' END),
        input1_unit_content_code = (CASE WHEN input1_unit IS NULL THEN NULL ELSE 'ef_input1_unit_${code}' END),
        input2_unit_content_code = (CASE WHEN input2_unit IS NULL THEN NULL ELSE 'ef_input2_unit_${code}' END),
        program_content_code = (CASE WHEN program IS NULL THEN NULL ELSE 'ef_program_${code}' END),
        url_program_content_code = (CASE WHEN url_program IS NULL THEN NULL ELSE 'ef_url_program_${code}' END)
        WHERE id = ${ef.id}`);

        if (ef.name && ef.name !== 'null') {
          await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_name_${code}', 'fr-FR', "${ef.name.replace(/"/g, '\\"')}")`);
          if (ef.wecount_name_english && ef.wecount_name_english !== 'null') {
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_name_${code}', 'en-GB', "${ef.wecount_name_english.replace(/"/g, '\\"')}")`);
          } else {
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_name_${code}', 'en-GB', "TODOEN-${ef.name.replace(/"/g, '\\"')}")`);
          }
        }
        if (ef.unit && ef.unit !== 'null') {
          await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_unit_${code}', 'fr-FR', "${ef.unit.replace(/"/g, '\\"')}")`);
          if (ef.english_unit && ef.english_unit !== 'null') {
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_unit_${code}', 'en-GB', "${ef.english_unit.replace(/"/g, '\\"')}")`);
          } else {
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_unit_${code}', 'en-GB', "TODOEN-${ef.unit.replace(/"/g, '\\"')}")`);
          }
        }
        
        const attributes = ['description', 'source', 'input1_unit', 'input2_unit', 'program', 'url_program'];
        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i];
          if (ef[attr] && ef[attr] !== 'null') {
            if (attr === 'url_program') {
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_${attr}_${code}', 'fr-FR', "${ef[attr].replace(/"/g, '\\"')}")`);
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_${attr}_${code}', 'en-GB', "${ef[attr].replace(/"/g, '\\"')}")`);
            } else {
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_${attr}_${code}', 'fr-FR', "${ef[attr].replace(/"/g, '\\"')}")`);
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('ef_${attr}_${code}', 'en-GB', "TODOEN-${ef[attr].replace(/"/g, '\\"')}")`);
            }
          }
        }
      }

      await queryRunner.query("ALTER TABLE `emission_factor` DROP `name`");
      await queryRunner.query("ALTER TABLE `emission_factor` DROP `description`");
      await queryRunner.query("ALTER TABLE `emission_factor` DROP `source`");
      await queryRunner.query("ALTER TABLE `emission_factor` DROP `unit`");
      await queryRunner.query("ALTER TABLE `emission_factor` DROP `input1_unit`");
      await queryRunner.query("ALTER TABLE `emission_factor` DROP `input2_unit`");
      await queryRunner.query("ALTER TABLE `emission_factor` DROP `program`");
      await queryRunner.query("ALTER TABLE `emission_factor` DROP `url_program`");


      // AM

      await queryRunner.query("ALTER TABLE `activity_model` ADD `name_content_code` varchar(255) NOT NULL");
      await queryRunner.query("ALTER TABLE `activity_model` ADD `description_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `activity_model` ADD `help_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `activity_model` ADD `help_iframe_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `activity_model` ADD `see_more_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `activity_model` ADD `see_more_iframe_content_code` varchar(255)");

      const activityModels = await queryRunner.query(`
        SELECT am.id, am.name, am.description, am.help, am.help_iframe, am.see_more, am.see_more_iframe FROM activity_model am
      `);
      const attributes = ['name', 'description', 'help', 'help_iframe', 'see_more', 'see_more_iframe'];
      for (let i = 0; i < activityModels.length; i++) {
        const am = activityModels[i];
        const code = `${am.id}_${randomUpperToken(5)}`;
        
        await queryRunner.query(`UPDATE activity_model SET 
        name_content_code = 'activity_model_name_${code}', 
        description_content_code = (CASE WHEN description IS NULL THEN NULL ELSE 'activity_model_description_${code}' END),
        help_content_code = (CASE WHEN help IS NULL THEN NULL ELSE 'activity_model_help_${code}' END),
        help_iframe_content_code = (CASE WHEN help_iframe IS NULL THEN NULL ELSE 'activity_model_help_iframe_${code}' END),
        see_more_content_code = (CASE WHEN see_more IS NULL THEN NULL ELSE 'activity_model_see_more_${code}' END),
        see_more_iframe_content_code = (CASE WHEN see_more_iframe IS NULL THEN NULL ELSE 'activity_model_see_more_iframe_${code}' END)
        WHERE id = ${am.id}`);

        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i];
          if (am[attr] && am[attr] !== 'null') {
            if (attr === 'help_iframe' || attr === 'see_more_iframe' || attr === 'help' || attr === 'see_more') {
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('activity_model_${attr}_${code}', 'fr-FR', "${am[attr].replace(/"/g, '\\"')}")`);
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('activity_model_${attr}_${code}', 'en-GB', "${am[attr].replace(/"/g, '\\"')}")`);
            } else {
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('activity_model_${attr}_${code}', 'fr-FR', "${am[attr].replace(/"/g, '\\"')}")`);
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('activity_model_${attr}_${code}', 'en-GB', "TODOEN-${am[attr].replace(/"/g, '\\"')}")`);
            }
          }
        }
      }

      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        await queryRunner.query("ALTER TABLE `activity_model` DROP `" + attr + "`");
      }


      // AC

      await queryRunner.query("ALTER TABLE `activity_category` ADD `name_content_code` varchar(255) NOT NULL");
      await queryRunner.query("ALTER TABLE `activity_category` ADD `description_content_code` varchar(255)");
      await queryRunner.query("ALTER TABLE `activity_category` ADD `action_plan_help_content_code` varchar(255)");

      const activityCategories = await queryRunner.query(`
        SELECT ac.id, ac.name, ac.description, ac.action_plan_help FROM activity_category ac
      `);
      const attributeACs = ['name', 'description', 'action_plan_help'];
      for (let i = 0; i < activityCategories.length; i++) {
        const ac = activityCategories[i];
        const code = `${ac.id}_${randomUpperToken(5)}`;
        
        await queryRunner.query(`UPDATE activity_category ac SET 
        name_content_code = 'activity_category_name_${code}', 
        description_content_code = (CASE WHEN description IS NULL THEN NULL ELSE 'activity_category_description_${code}' END),
        action_plan_help_content_code = (CASE WHEN action_plan_help IS NULL THEN NULL ELSE 'activity_category_action_plan_help_${code}' END)
        WHERE id = ${ac.id}`);

        for (let i = 0; i < attributeACs.length; i++) {
          const attr = attributeACs[i];
          if (ac[attr] && ac[attr] !== 'null') {
            if (attr === 'action_plan_help') {
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('activity_category_${attr}_${code}', 'fr-FR', "${ac[attr].replace(/"/g, '\\"')}")`);
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('activity_category_${attr}_${code}', 'en-GB', "${ac[attr].replace(/"/g, '\\"')}")`);
            } else {
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('activity_category_${attr}_${code}', 'fr-FR', "${ac[attr].replace(/"/g, '\\"')}")`);
              await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('activity_category_${attr}_${code}', 'en-GB', "TODOEN-${ac[attr].replace(/"/g, '\\"')}")`);
            }
            
          }
        }
      }

      for (let i = 0; i < attributeACs.length; i++) {
        const attr = attributeACs[i];
        await queryRunner.query("ALTER TABLE `activity_category` DROP `" + attr + "`");
      }


      // PA

      await queryRunner.query("ALTER TABLE `possible_action` ADD `name_content_code` varchar(255) NOT NULL");

      const possibleActions = await queryRunner.query(`
        SELECT pa.id, pa.name FROM possible_action pa
      `);
      const attributePAs = ['name'];
      for (let i = 0; i < possibleActions.length; i++) {
        const pa = possibleActions[i];
        const code = `${pa.id}_${randomUpperToken(5)}`;
        
        await queryRunner.query(`UPDATE possible_action pa SET 
        name_content_code = 'possible_action_name_${code}'
        WHERE id = ${pa.id}`);

        for (let i = 0; i < attributePAs.length; i++) {
          const attr = attributePAs[i];
          if (pa[attr] && pa[attr] !== 'null') {
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('possible_action_${attr}_${code}', 'fr-FR', "${pa[attr].replace(/"/g, '\\"')}")`);
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('possible_action_${attr}_${code}', 'en-GB', "TODOEN-${pa[attr].replace(/"/g, '\\"')}")`);
          }
        }
      }

      for (let i = 0; i < attributePAs.length; i++) {
        const attr = attributePAs[i];
        await queryRunner.query("ALTER TABLE `possible_action` DROP `" + attr + "`");
      }


      // ReglementationCategory

      await queryRunner.query("ALTER TABLE `reglementation_category` ADD `name_content_code` varchar(255) NULL");

      const rcs = await queryRunner.query(`
        SELECT rc.id, rc.name FROM reglementation_category rc
      `);
      const attributeRcs = ['name'];
      for (let i = 0; i < rcs.length; i++) {
        const rc = rcs[i];
        const code = `${rc.id}_${randomUpperToken(5)}`;
        
        await queryRunner.query(`UPDATE reglementation_category rc SET 
        name_content_code = 'reglementation_category_name_${code}'
        WHERE id = ${rc.id}`);

        for (let i = 0; i < attributeRcs.length; i++) {
          const attr = attributeRcs[i];
          if (rc[attr] && rc[attr] !== 'null') {
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('reglementation_category_${attr}_${code}', 'fr-FR', "${rc[attr].replace(/"/g, '\\"')}")`);
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('reglementation_category_${attr}_${code}', 'en-GB', "TODOEN-${rc[attr].replace(/"/g, '\\"')}")`);
          }
        }
      }

      for (let i = 0; i < attributeRcs.length; i++) {
        const attr = attributeRcs[i];
        await queryRunner.query("ALTER TABLE `reglementation_category` DROP `" + attr + "`");
      }

      // ReglementationSubCategory

      await queryRunner.query("ALTER TABLE `reglementation_sub_category` ADD `name_content_code` varchar(255) NULL");

      const rsubs = await queryRunner.query(`
        SELECT rsub.id, rsub.name FROM reglementation_sub_category rsub
      `);
      const attributeRsubs = ['name'];
      for (let i = 0; i < rsubs.length; i++) {
        const rsub = rsubs[i];
        const code = `${rsub.id}_${randomUpperToken(5)}`;
        
        await queryRunner.query(`UPDATE reglementation_sub_category rc SET 
        name_content_code = 'reglementation_sub_category_name_${code}'
        WHERE id = ${rsub.id}`);

        for (let i = 0; i < attributeRsubs.length; i++) {
          const attr = attributeRsubs[i];
          if (rsub[attr] && rsub[attr] !== 'null') {
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('reglementation_sub_category_${attr}_${code}', 'fr-FR', "${rsub[attr].replace(/"/g, '\\"')}")`);
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('reglementation_sub_category_${attr}_${code}', 'en-GB', "TODOEN-${rsub[attr].replace(/"/g, '\\"')}")`);
          }
        }
      }

      for (let i = 0; i < attributeRsubs.length; i++) {
        const attr = attributeRsubs[i];
        await queryRunner.query("ALTER TABLE `reglementation_sub_category` DROP `" + attr + "`");
      }


      // ReglementationTable

      await queryRunner.query("ALTER TABLE `reglementation_table` ADD `name_content_code` varchar(255) NULL");

      const rts = await queryRunner.query(`
        SELECT rt.id, rt.name FROM reglementation_table rt
      `);
      const attributeRts = ['name'];
      for (let i = 0; i < rts.length; i++) {
        const rt = rts[i];
        const code = `${rt.id}_${randomUpperToken(5)}`;
        
        await queryRunner.query(`UPDATE reglementation_table rt SET 
        name_content_code = 'reglementation_table_name_${code}'
        WHERE id = ${rt.id}`);

        for (let i = 0; i < attributeRts.length; i++) {
          const attr = attributeRts[i];
          if (rt[attr] && rt[attr] !== 'null') {
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('reglementation_table_${attr}_${code}', 'fr-FR', "${rt[attr].replace(/"/g, '\\"')}")`);
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('reglementation_table_${attr}_${code}', 'en-GB', "${rt[attr].replace(/"/g, '\\"')}")`);
          }
        }
      }

      for (let i = 0; i < attributeRts.length; i++) {
        const attr = attributeRts[i];
        await queryRunner.query("ALTER TABLE `reglementation_table` DROP `" + attr + "`");
      }


      // ScopeActionPlanHelp

      await queryRunner.query("ALTER TABLE `scope_action_plan_help` ADD `help_content_code` varchar(255)");

      const saps = await queryRunner.query(`
        SELECT sap.id, sap.help FROM scope_action_plan_help sap
      `);
      const attributeSaps = ['help'];
      for (let i = 0; i < saps.length; i++) {
        const sap = saps[i];
        const code = `${sap.id}_${randomUpperToken(5)}`;
        
        await queryRunner.query(`UPDATE scope_action_plan_help sap SET 
        help_content_code = 'scope_action_plan_help_help_${code}'
        WHERE id = ${sap.id}`);

        for (let i = 0; i < attributeSaps.length; i++) {
          const attr = attributeSaps[i];
          if (sap[attr] && sap[attr] !== 'null') {
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('scope_action_plan_help_${attr}_${code}', 'fr-FR', "${sap[attr].replace(/"/g, '\\"')}")`);
            await queryRunner.query(`INSERT INTO content (code, locale, text) VALUES ('scope_action_plan_help_${attr}_${code}', 'en-GB', "${sap[attr].replace(/"/g, '\\"')}")`);
          }
        }
      }

      for (let i = 0; i < attributeSaps.length; i++) {
        const attr = attributeSaps[i];
        await queryRunner.query("ALTER TABLE `scope_action_plan_help` DROP `" + attr + "`");
      }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";
import Ingestor from "@root/service/dataIngest/emissionFactor/Ingestor";
import IngestorCM from "@root/service/dataIngest/computeMethod/Ingestor";
import { DbName } from "@root/entity/enum/EmissionFactorEnums";
import SqlConnection from "@deep/database/SqlConnection";

export class DbRebuild1631273877109 implements MigrationInterface {
    name = 'DbRebuild1631273877109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_entry` ADD `temp_ef_wecount_id` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `activity_entry` ADD `temp_ef_ademe_id` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `activity_entry` ADD `temp_efi_id` varchar(255) NULL");

        await queryRunner.query("UPDATE activity_entry ae INNER JOIN emission_factor ef ON ef.id = ae.emission_factor_id INNER JOIN emission_factor_info efi ON efi.id = ef.emission_factor_info_id SET ae.temp_ef_wecount_id = efi.info_wecount_id, ae.temp_ef_ademe_id = SUBSTRING_INDEX(SUBSTRING_INDEX(efi.info_fes_id,',',1), '.', 1), ae.temp_efi_id = efi.id;");
        await queryRunner.query("UPDATE activity_entry ae SET emission_factor_id = NULL");

        await queryRunner.query("DELETE FROM emission_factor_mapping");

        await queryRunner.query("ALTER TABLE `emission_factor_mapping` ADD `recommended` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping` ADD `compute_method_id` int NOT NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping` DROP FOREIGN KEY `FK_2d59a0fd7a6ac1f980ea896555c`");
        await queryRunner.query("CREATE TABLE `emission_factor_by_company` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `company_id` int NOT NULL, `emission_factor_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `emission_factor_by_company_group` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `company_group_id` int NOT NULL, `emission_factor_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping` DROP COLUMN `attribute_value_id`");
        await queryRunner.query("ALTER TABLE `emission_factor_by_company` ADD CONSTRAINT `FK_b2285ee51cd8dcb058a1924fa0f` FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `emission_factor_by_company` ADD CONSTRAINT `FK_a9748877cdf59fb76047b42a7f4` FOREIGN KEY (`emission_factor_id`) REFERENCES `emission_factor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `emission_factor_by_company_group` ADD CONSTRAINT `FK_55313cb0d6572ab1a3973e6caac` FOREIGN KEY (`company_group_id`) REFERENCES `company_group`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `emission_factor_by_company_group` ADD CONSTRAINT `FK_ddd63762f5254e7563f686136f6` FOREIGN KEY (`emission_factor_id`) REFERENCES `emission_factor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping` ADD CONSTRAINT `FK_e67bdeba802269d26df52cbd7a8` FOREIGN KEY (`compute_method_id`) REFERENCES `compute_method`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("DROP TABLE attribute_compute_mapping");
        await queryRunner.query("DROP TABLE attribute_value");
        await queryRunner.query("DROP TABLE attribute");


        await queryRunner.query("DELETE FROM emission_factor");
        await queryRunner.query("DELETE FROM emission_factor_info");
        
        await queryRunner.query("ALTER TABLE `emission_factor` DROP COLUMN `input1_unit_manual_text`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_wecount_id`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_fes_id`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_duplicate`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_label_ademe`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_nom_frontiere_francais`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_nom_base_francais`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_statut`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_commentaire_interne`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_formule_speciale`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_fes_autre_base_carbone`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_emission_factor_raw`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_unite_base_carbone`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_homogeneisation_unite`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_unite_corrigee_tonnes`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_incertitude_corrigee`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_source_si_autre_que_bc`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_commentaire_additionel_we_count_sur_la_source`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_co2f`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_ch4f`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_ch4b`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_n2o`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_code_gaz_supplementaire`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_valeur_gaz_supplementaire`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_code_gaz_supplementaire2`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_valeur_gaz_supplementaire2`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_code_gaz_supplementaire3`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_valeur_gaz_supplementaire3`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_code_gaz_supplementaire4`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_valeur_gaz_supplementaire4`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_code_gaz_supplementaire5`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_valeur_gaz_supplementaire5`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_autre_ges`");
        await queryRunner.query("ALTER TABLE `emission_factor_info` DROP COLUMN `info_co2b`");
        
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `element_type` enum ('POSTE', 'ELEMENT') NOT NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `db_name` enum ('WECOUNT', 'ADEME') NOT NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `old_wecount_ids` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `old_fes_id` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `db_id` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `program` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `url_program` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `is_private` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `archived` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `archived_reason` enum ('DEPRECATE', 'ERROR', 'OTHER') NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `archived_comment` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `inactive` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `inactive_reason` enum ('POSTE', 'ERROR', 'OTHER') NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `inactive_comment` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `official_creation_date` datetime NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `official_modification_date` datetime NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `validity_period` datetime NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `line_type` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `structure` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `french_base_name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `english_base_name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `spanish_base_name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `french_attribute_name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `english_attribute_name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `spanish_attribute_name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `french_border_name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `english_border_name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `spanish_border_name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `category_core` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `french_tags` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `english_tags` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `spanish_tags` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `french_unit` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `english_unit` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `spanish_unit` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `contributor` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `other_contributors` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `geographic_localization` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `geographic_sub_localization_french` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `geographic_sub_localization_english` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `geographic_sub_localization_spanish` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `regulations` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `transparency` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `quality` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `quality_ter` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `quality_gr` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `quality_tir` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `quality_c` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `quality_p` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `quality_m` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `french_comment` text NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `english_comment` text NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `spanish_comment` text NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `post_type` text NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `french_post_name` text NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `english_post_name` text NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `spanish_post_name` text NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `c_o2f` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `c_h4f` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `c_h4b` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `n2o` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `code_gaz_supplementaire` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `valeur_gaz_supplementaire` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `code_gaz_supplementaire2` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `valeur_gaz_supplementaire2` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `code_gaz_supplementaire3` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `valeur_gaz_supplementaire3` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `code_gaz_supplementaire4` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `valeur_gaz_supplementaire4` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `code_gaz_supplementaire5` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `valeur_gaz_supplementaire5` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `autre_ges` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `c_o2b` float NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `wecount_name_french` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `wecount_name_english` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `tag1` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `tag2` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `tag3` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `tag4` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `element_information` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_info` ADD `uncertainty_was_unknown_at_ingestion_time` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `emission_factor` DROP COLUMN `name`");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` DROP COLUMN `source`");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `source` text NULL");
        await queryRunner.query("ALTER TABLE `emission_factor` DROP COLUMN `unit`");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `unit` varchar(255) NULL");

        await queryRunner.query("ALTER TABLE `compute_method` ADD `emission_factor_search_type` enum ('COMBO_BOX', 'SEARCH_BOX') NOT NULL DEFAULT 'COMBO_BOX'");
        await queryRunner.query("ALTER TABLE `compute_method` ADD `emission_factor_label` varchar(255) NULL");
        
        const ingestorWc = new Ingestor('files/temp/fes_wecount.csv', DbName.WECOUNT);
        try {
          await ingestorWc.read();
          await ingestorWc.ingest();
        } catch (e) {
          throw e;
        }
        const ingestorAdeme = new Ingestor('files/temp/fes_ademe.csv', DbName.ADEME);
        try {
          await ingestorAdeme.read();
          await ingestorAdeme.ingest();
        } catch (e) {
          throw e;
        }
        
        await queryRunner.query(`
          UPDATE activity_entry ae 
          INNER JOIN emission_factor ef 
            ON (ef.old_fes_id = ae.temp_efi_id) AND ef.element_type = 'ELEMENT' AND ae.emission_factor_id IS NULL 
          SET ae.emission_factor_id = ef.id
        `);
        await queryRunner.query(`
          UPDATE activity_entry ae 
          INNER JOIN emission_factor ef 
            ON (ef.db_id = ae.temp_ef_ademe_id OR ef.old_fes_id = ae.temp_ef_ademe_id) AND ef.element_type = 'ELEMENT' AND ae.emission_factor_id IS NULL 
          SET ae.emission_factor_id = ef.id
        `);
        await queryRunner.query(`
          UPDATE activity_entry ae 
          INNER JOIN emission_factor ef 
            ON (ef.db_id = ae.temp_ef_wecount_id OR ef.old_wecount_ids REGEXP concat('^(.*[^0-9]+)?', ae.temp_ef_wecount_id, '([^0-9]+.*)?$')) AND ef.element_type = 'ELEMENT' AND ae.emission_factor_id IS NULL 
          SET ae.emission_factor_id = ef.id`);

        const ingestorCm = new IngestorCM('files/temp/compute_methods.csv');
        try {
          await ingestorCm.read();
          await ingestorCm.ingest();
        } catch (e) {
          throw e;
        }

        // CHECK no AE is left without EF
        const aeToUpdate = await queryRunner.query(`
          SELECT count(*) FROM  activity_entry ae
          WHERE ae.compute_method_type = 'STANDARD' AND result_tco2!= 0 AND ae.emission_factor_id IS NULL`);
        console.log('NB AE TO UPDATE', aeToUpdate[0]);

        await queryRunner.query(`
          UPDATE activity_entry ae
          SET ae.compute_method_type = 'RAW_DATA', compute_method_id = NULL, manual_tco2 = result_tco2, value = NULL, value2 = NULL
          WHERE ae.compute_method_type = 'STANDARD' AND result_tco2!= 0 AND ae.emission_factor_id IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_category_setting` DROP FOREIGN KEY `FK_75e7e93d9c2d8eaa404ac25bcd1`");
        await queryRunner.query("ALTER TABLE `activity_category_setting` DROP FOREIGN KEY `FK_84e1d9df1d985a2686a089a36db`");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping` DROP FOREIGN KEY `FK_e67bdeba802269d26df52cbd7a8`");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
        await queryRunner.query("ALTER TABLE `activity_entry` DROP COLUMN `temp_ef_ademe_id`");
        await queryRunner.query("ALTER TABLE `activity_entry` DROP COLUMN `temp_ef_wecount_id`");
    }

}

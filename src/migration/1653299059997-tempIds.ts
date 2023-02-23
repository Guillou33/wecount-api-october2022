import {MigrationInterface, QueryRunner} from "typeorm";

export class tempIds1653299059997 implements MigrationInterface {
    name = 'tempIds1653299059997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `emission_factor_tag` ADD `temp_ingestion_id` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` ADD `temp_ingestion_id` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping` CHANGE `position` `position` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` DROP COLUMN `temp_ingestion_id`");
        await queryRunner.query("ALTER TABLE `emission_factor_tag` DROP COLUMN `temp_ingestion_id`");
    }

}

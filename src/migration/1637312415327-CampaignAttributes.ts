import {MigrationInterface, QueryRunner} from "typeorm";

export class CampaignAttributes1637312415327 implements MigrationInterface {
    name = 'CampaignAttributes1637312415327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `campaign` ADD `status` enum ('IN_PREPARATION', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'IN_PROGRESS'");
        await queryRunner.query("ALTER TABLE `campaign` ADD `type` enum ('CARBON_FOOTPRINT', 'SIMULATION') NOT NULL DEFAULT 'CARBON_FOOTPRINT'");
        await queryRunner.query("UPDATE campaign SET reference_year = 2021 WHERE reference_year IS NULL");
        await queryRunner.query("ALTER TABLE `campaign` CHANGE `reference_year` `reference_year` year NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `campaign` CHANGE `reference_year` `reference_year` year NULL");
        await queryRunner.query("ALTER TABLE `campaign` DROP COLUMN `type`");
        await queryRunner.query("ALTER TABLE `campaign` DROP COLUMN `status`");
    }

}

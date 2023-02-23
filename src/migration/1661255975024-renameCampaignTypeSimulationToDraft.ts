import {MigrationInterface, QueryRunner} from "typeorm";

export class addDraftCampaigns1661255975024 implements MigrationInterface {
    name = 'addDraftCampaigns1661255975024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `campaign` CHANGE `type` `type` enum ('CARBON_FOOTPRINT', 'SIMULATION', 'DRAFT') NOT NULL DEFAULT 'CARBON_FOOTPRINT'");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL DEFAULT NULL");

        await queryRunner.query(`UPDATE campaign SET type="DRAFT" WHERE type = "SIMULATION"`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
        await queryRunner.query("ALTER TABLE `campaign` CHANGE `type` `type` enum ('CARBON_FOOTPRINT', 'SIMULATION', 'PROJECTION') NOT NULL DEFAULT 'CARBON_FOOTPRINT'");
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class setEntriesExcludedFromTrajectory1640252275687 implements MigrationInterface {
    name = 'setEntriesExcludedFromTrajectory1640252275687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_entry` ADD `is_excluded_from_trajectory` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
        await queryRunner.query("ALTER TABLE `activity_entry` DROP COLUMN `is_excluded_from_trajectory`");
    }

}

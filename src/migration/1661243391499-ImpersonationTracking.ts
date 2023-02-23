import {MigrationInterface, QueryRunner} from "typeorm";

export class ImpersonationTracking1661243391499 implements MigrationInterface {
    name = 'ImpersonationTracking1661243391499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_entry` ADD `last_update_by_admin_impersonation` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_entry` DROP COLUMN `last_update_by_admin_impersonation`");
    }

}

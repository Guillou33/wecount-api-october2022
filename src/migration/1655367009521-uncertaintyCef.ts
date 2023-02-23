import {MigrationInterface, QueryRunner} from "typeorm";

export class uncertaintyCef1655367009521 implements MigrationInterface {
    name = 'uncertaintyCef1655367009521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `custom_emission_factor` ADD `source` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `custom_emission_factor` DROP COLUMN `source`");
    }

}

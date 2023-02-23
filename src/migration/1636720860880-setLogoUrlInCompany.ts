import {MigrationInterface, QueryRunner} from "typeorm";

export class setLogoUrlInCompany1636720860880 implements MigrationInterface {
    name = 'setLogoUrlInCompany1636720860880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `company` ADD `logo_url` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
        await queryRunner.query("ALTER TABLE `company` DROP COLUMN `logo_url`");
    }

}

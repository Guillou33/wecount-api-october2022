import {MigrationInterface, QueryRunner} from "typeorm";

export class cmHasAllEF1657179999233 implements MigrationInterface {
    name = 'cmHasAllEF1657179999233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compute_method` ADD `has_all_ef` tinyint NOT NULL");
        await queryRunner.query("UPDATE `compute_method` SET `has_all_ef` = true, `emission_factor_search_type` = 'SEARCH_BOX' WHERE `id` IN (63, 64, 65)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compute_method` DROP COLUMN `has_all_ef`");
    }

}

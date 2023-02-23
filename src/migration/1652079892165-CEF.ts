import {MigrationInterface, QueryRunner} from "typeorm";

export class CEF1652079892165 implements MigrationInterface {
    name = 'CEF1652079892165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `custom_emission_factor` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `value` float NOT NULL, `name` varchar(255) NOT NULL, `input1_name` varchar(255) NOT NULL, `input1_unit` varchar(255) NOT NULL, `comment` text NULL, `archived_date` datetime NULL, `perimeter_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `activity_entry` ADD `custom_emission_factor_value` float NULL");
        await queryRunner.query("ALTER TABLE `activity_entry` ADD `custom_emission_factor_id` int NULL");
        await queryRunner.query("ALTER TABLE `activity_entry` CHANGE `compute_method_type` `compute_method_type` enum ('STANDARD', 'EMISSION_FACTOR', 'CUSTOM_EMISSION_FACTOR', 'RAW_DATA') NOT NULL DEFAULT 'STANDARD'");
        await queryRunner.query("ALTER TABLE `custom_emission_factor` ADD CONSTRAINT `FK_0484a9699b2b949290f196016b9` FOREIGN KEY (`perimeter_id`) REFERENCES `perimeter`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `activity_entry` ADD CONSTRAINT `FK_ce59d9d4cf70914db6657a1c7e1` FOREIGN KEY (`custom_emission_factor_id`) REFERENCES `custom_emission_factor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_entry` DROP FOREIGN KEY `FK_ce59d9d4cf70914db6657a1c7e1`");
        await queryRunner.query("ALTER TABLE `custom_emission_factor` DROP FOREIGN KEY `FK_0484a9699b2b949290f196016b9`");
        await queryRunner.query("ALTER TABLE `activity_entry` CHANGE `compute_method_type` `compute_method_type` enum ('STANDARD', 'EMISSION_FACTOR', 'RAW_DATA') NOT NULL DEFAULT 'STANDARD'");
        await queryRunner.query("ALTER TABLE `activity_entry` DROP COLUMN `custom_emission_factor_id`");
        await queryRunner.query("ALTER TABLE `activity_entry` DROP COLUMN `custom_emission_factor_value`");
        await queryRunner.query("DROP TABLE `custom_emission_factor`");
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class EFTags1649856944513 implements MigrationInterface {
    name = 'EFTags1649856944513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `emission_factor_tag_label` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `name` varchar(255) NOT NULL, `is_root` tinyint NOT NULL, `is_final` tinyint NOT NULL, `parent_label_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `emission_factor_tag` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `name` varchar(255) NOT NULL, `emission_factor_tag_label_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `emission_factor_tag_label_mapping` (`id` int NOT NULL AUTO_INCREMENT, `emission_factor_tag_label_id` int NOT NULL, `compute_method_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `emission_factor` ADD `tag_ids` json NOT NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` ADD CONSTRAINT `FK_3b0c166616c3bbe19e095bb3c2f` FOREIGN KEY (`parent_label_id`) REFERENCES `emission_factor_tag_label`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `emission_factor_tag` ADD CONSTRAINT `FK_560b6fdd3170c2fd7c575c76056` FOREIGN KEY (`emission_factor_tag_label_id`) REFERENCES `emission_factor_tag_label`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label_mapping` ADD CONSTRAINT `FK_e453f6ca65e36362c3769538fce` FOREIGN KEY (`emission_factor_tag_label_id`) REFERENCES `emission_factor_tag_label`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label_mapping` ADD CONSTRAINT `FK_80e3dda0c1e4e4be4b9eeb69ad7` FOREIGN KEY (`compute_method_id`) REFERENCES `compute_method`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("UPDATE `emission_factor` SET `tag_ids` = '[]'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label_mapping` DROP FOREIGN KEY `FK_80e3dda0c1e4e4be4b9eeb69ad7`");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label_mapping` DROP FOREIGN KEY `FK_28d815bc5abad0f9ccd37a59215`");
        await queryRunner.query("ALTER TABLE `emission_factor_tag` DROP FOREIGN KEY `FK_560b6fdd3170c2fd7c575c76056`");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` DROP FOREIGN KEY `FK_3b0c166616c3bbe19e095bb3c2f`");
        await queryRunner.query("ALTER TABLE `emission_factor` DROP COLUMN `tag_ids`");
        await queryRunner.query("DROP TABLE `emission_factor_tag_label_mapping`");
        await queryRunner.query("DROP TABLE `emission_factor_tag`");
        await queryRunner.query("DROP TABLE `emission_factor_tag_label`");
    }

}

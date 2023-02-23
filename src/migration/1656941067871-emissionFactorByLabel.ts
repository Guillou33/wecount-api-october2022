import {MigrationInterface, QueryRunner} from "typeorm";

export class emissionFactorByLabel1656941067871 implements MigrationInterface {
    name = 'emissionFactorByLabel1656941067871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("RENAME TABLE `emission_factor_mapping` TO `emission_factor_mapping_old`");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping_old` DROP FOREIGN KEY `FK_6cb2f778da3558c0c4a6d13abfc`");
        await queryRunner.query("CREATE TABLE `emission_factor_mapping` (`id` int NOT NULL AUTO_INCREMENT, `recommended` tinyint NOT NULL, `emission_factor_id` int NOT NULL, `emission_factor_tag_label_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping` ADD CONSTRAINT `FK_6cb2f778da3558c0c4a6d13abfc` FOREIGN KEY (`emission_factor_id`) REFERENCES `emission_factor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping` ADD CONSTRAINT `FK_26f9c45ae8654d636b52a064da7` FOREIGN KEY (`emission_factor_tag_label_id`) REFERENCES `emission_factor_tag_label`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

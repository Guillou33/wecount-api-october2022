import {MigrationInterface, QueryRunner} from "typeorm";

export class setActivityModelInActionplan1638454777302 implements MigrationInterface {
    name = 'setActivityModelInActionplan1638454777302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `action_plan` ADD `activity_model_id` int NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `action_plan` ADD CONSTRAINT `FK_69378a77c14200e67ba73ed4f62` FOREIGN KEY (`activity_model_id`) REFERENCES `activity_model`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `action_plan` DROP FOREIGN KEY `FK_69378a77c14200e67ba73ed4f62`");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
        await queryRunner.query("ALTER TABLE `action_plan` DROP COLUMN `activity_model_id`");
    }

}

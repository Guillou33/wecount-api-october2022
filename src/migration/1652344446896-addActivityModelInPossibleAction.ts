import {MigrationInterface, QueryRunner} from "typeorm";

export class addActivityModelInPossibleAction1652344446896 implements MigrationInterface {
    name = 'addActivityModelInPossibleAction1652344446896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `possible_action` ADD `activity_model_id` int NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_mapping` CHANGE `position` `position` int NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `possible_action` ADD CONSTRAINT `FK_ab1c03dfc946a83c94256b7b8f1` FOREIGN KEY (`activity_model_id`) REFERENCES `activity_model`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `possible_action` DROP FOREIGN KEY `FK_ab1c03dfc946a83c94256b7b8f1`");
        await queryRunner.query("ALTER TABLE `possible_action` DROP COLUMN `activity_model_id`");
    }

}

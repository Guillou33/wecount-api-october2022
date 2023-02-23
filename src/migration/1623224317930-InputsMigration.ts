import {MigrationInterface, QueryRunner} from "typeorm";

export class InputsMigration1623224317930 implements MigrationInterface {
    name = 'InputsMigration1623224317930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compute_method` ADD `value_name` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `compute_method` ADD `value2_name` varchar(255) NULL");

        const computeMethods = await queryRunner.query("SELECT compute_method.id as cmid, am.id as amid, am.value_name, am.value2_name FROM compute_method INNER JOIN activity_model am ON am.id = compute_method.activity_model_id");

        for (let i = 0; i < computeMethods.length; i++) {
          const cm = computeMethods[i];
          await queryRunner.query("UPDATE `compute_method` SET value_name=? WHERE id = " + cm.cmid, [cm.value_name]);
          await queryRunner.query("UPDATE `compute_method` SET value2_name=? WHERE id = " + cm.cmid, [cm.value2_name]);
        }

        await queryRunner.query("ALTER TABLE `activity_model` DROP COLUMN `value_name`");
        await queryRunner.query("ALTER TABLE `activity_model` DROP COLUMN `value2_name`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

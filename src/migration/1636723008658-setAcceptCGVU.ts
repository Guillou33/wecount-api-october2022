import {MigrationInterface, QueryRunner} from "typeorm";

export class setAcceptCGVU1636723008658 implements MigrationInterface {
    name = 'setAcceptCGVU1636723008658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `accept_cgvu` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `accept_cgvu`");
    }

}

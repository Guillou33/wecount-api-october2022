import {MigrationInterface, QueryRunner} from "typeorm";

export class setDescriptionInCommentsBefore130120221642520489878 implements MigrationInterface {
    name = 'setDescriptionInCommentsBefore130120221642520489878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL DEFAULT NULL");
        await queryRunner.query("UPDATE action_plan set comments = CONCAT(comments, description) WHERE comments IS NOT NULL and description IS NOT NULL");
        await queryRunner.query("UPDATE action_plan set comments = description WHERE comments IS NULL and description IS NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class setReductionToNegativeBefore130120221642496373667 implements MigrationInterface {
    name = 'setReductionToNegativeBefore130120221642496373667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL DEFAULT NULL");
        await queryRunner.query("UPDATE action_plan set reduction = reduction * (-1) where reduction IS NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
    }

}

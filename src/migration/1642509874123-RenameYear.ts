import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameYear1642509874123 implements MigrationInterface {
    name = 'RenameYear1642509874123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `campaign` CHANGE `reference_year` `year` year NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `campaign` CHANGE `year` `reference_year` year NOT NULL");
    }

}

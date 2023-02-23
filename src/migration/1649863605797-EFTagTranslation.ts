import {MigrationInterface, QueryRunner} from "typeorm";

export class EFTagTranslation1649863605797 implements MigrationInterface {
    name = 'EFTagTranslation1649863605797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `emission_factor_tag` CHANGE `name` `name_content_code` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` CHANGE `name` `name_content_code` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` CHANGE `name_content_code` `name` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `emission_factor_tag` CHANGE `name_content_code` `name` varchar(255) NOT NULL");
    }

}

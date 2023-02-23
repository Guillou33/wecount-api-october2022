import {MigrationInterface, QueryRunner} from "typeorm";

export class refactoAER1642583148735 implements MigrationInterface {
    name = 'refactoAER1642583148735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `UniqueReferenceId` ON `activity_entry_reference`");
        await queryRunner.query("ALTER TABLE `activity_entry_reference` ADD `raw_reference_id` varchar(255) DEFAULT NULL");
        await queryRunner.query("UPDATE `activity_entry_reference` SET `raw_reference_id` = `reference_id`");
        await queryRunner.query("ALTER TABLE `activity_entry_reference` CHANGE `raw_reference_id` `raw_reference_id` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `activity_entry_reference` ADD UNIQUE INDEX `IDX_1a90d335b585a74faabba80a23` (`raw_reference_id`)");
        await queryRunner.query("CREATE UNIQUE INDEX `UniqueRawReferenceId` ON `activity_entry_reference` (`raw_reference_id`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

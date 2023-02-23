import {MigrationInterface, QueryRunner} from "typeorm";

export class ComputeMethodType1623140172149 implements MigrationInterface {
    name = 'ComputeMethodType1623140172149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_entry` ADD `compute_method_type` enum ('STANDARD', 'EMISSION_FACTOR', 'RAW_DATA') NOT NULL DEFAULT 'STANDARD'");

        await queryRunner.query("UPDATE activity_entry ae SET compute_method_type = (CASE WHEN manual_tco2 IS NULL AND manual_unit_number IS NULL THEN 'STANDARD' WHEN manual_unit_number IS NULL THEN 'RAW_DATA' ELSE 'EMISSION_FACTOR' END) ");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

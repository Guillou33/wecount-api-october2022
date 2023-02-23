import {MigrationInterface, QueryRunner} from "typeorm";

export class ActivityComputeMappingRenaming1620632262755 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`RENAME TABLE attribute_activity_mapping TO attribute_compute_mapping`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

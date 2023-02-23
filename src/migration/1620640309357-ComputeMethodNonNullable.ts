import {MigrationInterface, QueryRunner} from "typeorm";

export class ComputeMethodNonNullable1620640309357 implements MigrationInterface {
    name = 'ComputeMethodNonNullable1620640309357'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("ALTER TABLE `attribute_compute_mapping` CHANGE `compute_method_id` `compute_method_id` int NOT NULL");
      await queryRunner.query("ALTER TABLE `attribute_compute_mapping` DROP CONSTRAINT `FK_a047142399fdc583b99f64ce232`");
      await queryRunner.query("DROP INDEX `FK_a047142399fdc583b99f64ce232` ON `attribute_compute_mapping`");
      await queryRunner.query("ALTER TABLE `attribute_compute_mapping` ADD CONSTRAINT `FK_e8b19c07d4e3dc1cdf1c557751a` FOREIGN KEY (`attribute_id`) REFERENCES `attribute`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class SpecialComputeMode1622464547043 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("ALTER TABLE `compute_method` ADD `special_compute_mode` enum ('ACCOUNTING_DEPRECIATION') NULL");

      const activityModels = await queryRunner.query("SELECT am.special_compute_mode, am.id FROM activity_model am WHERE am.special_compute_mode IS NOT NULL ");
      for (let i = 0; i < activityModels.length; i++) {
        const activityModel = activityModels[i];
        await queryRunner.query("UPDATE `compute_method` SET special_compute_mode = '" + activityModel.special_compute_mode + "' WHERE activity_model_id = " + activityModel.id);
      }

      await queryRunner.query("ALTER TABLE `activity_model` DROP COLUMN `special_compute_mode`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

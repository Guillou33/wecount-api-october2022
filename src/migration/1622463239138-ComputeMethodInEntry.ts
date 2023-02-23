import {MigrationInterface, QueryRunner} from "typeorm";

export class ComputeMethodInEntry1622463239138 implements MigrationInterface {
    name = 'ComputeMethodInEntry1622463239138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_entry` ADD `compute_method_id` int DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `activity_entry` ADD CONSTRAINT `FK_7cd140e5c75b3641ee35e527908` FOREIGN KEY (`compute_method_id`) REFERENCES `compute_method`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");

        const activityEntries = await queryRunner.query("SELECT ae.id, cm.id as compute_method_id, ae.manual_tco2, ae.manual_unit_number, ae.emission_factor_id FROM activity_entry ae INNER JOIN activity a ON ae.activity_id = a.id INNER JOIN activity_model am ON am.id = a.activity_model_id INNER JOIN compute_method cm ON cm.activity_model_id = am.id AND cm.is_default = true");

        for (let i = 0; i < activityEntries.length; i++) {
          const activityEntry = activityEntries[i];
          if (activityEntry.emission_factor_id !== null) {
            await queryRunner.query("UPDATE `activity_entry` SET compute_method_id = " + activityEntry.compute_method_id + " WHERE id = " + activityEntry.id);
          }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class ComputeMethod1620637804308 implements MigrationInterface {
    name = 'ComputeMethod1620637804308'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `compute_method` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `name` varchar(255) NOT NULL, `description` text NULL, `position` int NOT NULL, `is_default` tinyint NOT NULL, `activity_model_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `compute_method` ADD CONSTRAINT `FK_19e7ad0d1dc4ac1a892a19a3a00` FOREIGN KEY (`activity_model_id`) REFERENCES `activity_model`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");

        const activityModels = await queryRunner.query("SELECT * FROM activity_model");

        for (let i = 0; i < activityModels.length; i++) {
          const am = activityModels[i];
          await queryRunner.query("INSERT INTO `compute_method` (`name`, `description`, `position`, `is_default`, `activity_model_id`) VALUES ('Méthode standard', NULL, 1, true, " + am.id + ")");
        }

        const computeMethods = await queryRunner.query("SELECT * FROM compute_method");

        const attributeComputeMappings = await queryRunner.query("SELECT * FROM attribute_compute_mapping");

        
        await queryRunner.query("ALTER TABLE `attribute_compute_mapping` ADD `compute_method_id` int NULL");
        await queryRunner.query("ALTER TABLE `attribute_compute_mapping` ADD CONSTRAINT `FK_0585e05dabc6b51f7f7338ef0be` FOREIGN KEY (`compute_method_id`) REFERENCES `compute_method`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");

        for (let i = 0; i < attributeComputeMappings.length; i++) {
          const attributeComputeMapping = attributeComputeMappings[i];
          const computeMethod = computeMethods.find((cm: any) => {
            return cm.activity_model_id === attributeComputeMapping.activity_model_id
          });
          await queryRunner.query("UPDATE `attribute_compute_mapping` SET compute_method_id = " + computeMethod.id + " WHERE attribute_compute_mapping.activity_model_id = " + attributeComputeMapping.activity_model_id);
        }

        await queryRunner.query("ALTER TABLE `attribute_compute_mapping` DROP CONSTRAINT `FK_0d95c433ccf6ec58f3608be85d4`");
        await queryRunner.query("ALTER TABLE `attribute_compute_mapping` DROP `activity_model_id`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

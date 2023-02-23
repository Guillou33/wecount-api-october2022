import { randomUpperToken } from "@root/service/utils/tokenGenerator";
import {MigrationInterface, QueryRunner} from "typeorm";

export class ActivityEntryReference1637318915254 implements MigrationInterface {
    name = 'ActivityEntryReference1637318915254'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("CREATE TABLE `activity_entry_reference` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `reference_id` varchar(255) NOT NULL, UNIQUE INDEX `UniqueReferenceId` (`reference_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");

      
      await queryRunner.query("ALTER TABLE `activity_entry` ADD `activity_entry_reference_id` int DEFAULT NULL");
      await queryRunner.query("ALTER TABLE `activity_entry` ADD CONSTRAINT `FK_77b6c5c30abc0d8968dd3ed4d06` FOREIGN KEY (`activity_entry_reference_id`) REFERENCES `activity_entry_reference`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");

      const activitiesEntries = await queryRunner.query(`
        SELECT ae.id FROM  activity_entry ae
      `);
      const referenceIdList: string[] = [];
      for (let i = 0; i < activitiesEntries.length; i++) {
        const activitiesEntry = activitiesEntries[i];
        
        let referenceId: string;
        do {
          referenceId = randomUpperToken(5);
        } while (referenceIdList.indexOf(referenceId) !== -1)
        referenceIdList.push(referenceId);
        
        const id = i + 1;

        await queryRunner.query(`INSERT INTO activity_entry_reference (id, created_at, updated_at, reference_id) VALUES (${id}, '2021-12-01', '2021-12-01', '${referenceId}')`);

        await queryRunner.query(`
          UPDATE activity_entry ae
          SET ae.activity_entry_reference_id = ${id}
          WHERE ae.id = ${activitiesEntry['id']}`);
      }

      await queryRunner.query("ALTER TABLE `activity_entry` DROP FOREIGN KEY `FK_77b6c5c30abc0d8968dd3ed4d06`");
        await queryRunner.query("ALTER TABLE `activity_entry` CHANGE `activity_entry_reference_id` `activity_entry_reference_id` int NOT NULL");
        await queryRunner.query("ALTER TABLE `activity_entry` ADD CONSTRAINT `FK_77b6c5c30abc0d8968dd3ed4d06` FOREIGN KEY (`activity_entry_reference_id`) REFERENCES `activity_entry_reference`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

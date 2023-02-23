import { ActivityEntry } from "@root/entity";
import {
  activityEntryResultISOManager,
  activityEntryResultGHGManager,
  activityEntryResultBEGESManager,
} from "@root/manager";
import {MigrationInterface, QueryRunner, getConnection, } from "typeorm";

export class refactorReglementaionTables1658835444763 implements MigrationInterface {
    name = 'refactorReglementaionTables1658835444763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `activity_entry_result_beges` (`id` int NOT NULL AUTO_INCREMENT, `deleted_at` datetime(6) NULL, `result` float NOT NULL, `uncertainty` float NOT NULL, `co2` float NOT NULL, `ch4` float NOT NULL, `n2o` float NOT NULL, `other_gaz` float NOT NULL, `co2b` float NOT NULL, `activity_entry_id` int NULL, `sub_category_id` int NULL, `campaign_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `activity_entry_result_iso` (`id` int NOT NULL AUTO_INCREMENT, `deleted_at` datetime(6) NULL, `result` float NOT NULL, `uncertainty` float NOT NULL, `co2` float NOT NULL, `ch4` float NOT NULL, `n2o` float NOT NULL, `fluored_gaz` float NOT NULL, `other_gaz` float NOT NULL, `co2b_combustion` float NOT NULL, `co2b_other` float NOT NULL, `activity_entry_id` int NULL, `sub_category_id` int NULL, `campaign_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `activity_entry_result_ghg` (`id` int NOT NULL AUTO_INCREMENT, `deleted_at` datetime(6) NULL, `result` float NOT NULL, `uncertainty` float NOT NULL, `co2` float NOT NULL, `ch4` float NOT NULL, `n2o` float NOT NULL, `hfcs` float NOT NULL, `pfcs` float NOT NULL, `sf6` float NOT NULL, `other_gaz` float NOT NULL, `co2b` float NOT NULL, `activity_entry_id` int NULL, `sub_category_id` int NULL, `campaign_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `reglementation_sub_category_mappings_for_exceptions` ADD `table_code` enum ('ISO', 'BEGES', 'GHG') NOT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `activity_entry_result_beges` ADD CONSTRAINT `FK_4c79422b53e0a7836e33d17882a` FOREIGN KEY (`activity_entry_id`) REFERENCES `activity_entry`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `activity_entry_result_beges` ADD CONSTRAINT `FK_c593c3f7254483509d56eafdce8` FOREIGN KEY (`sub_category_id`) REFERENCES `reglementation_sub_category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `activity_entry_result_beges` ADD CONSTRAINT `FK_442a493e84bf43296ee3183e99a` FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `activity_entry_result_iso` ADD CONSTRAINT `FK_d9d3feaa7f8dc4e4ec36cc1b824` FOREIGN KEY (`activity_entry_id`) REFERENCES `activity_entry`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `activity_entry_result_iso` ADD CONSTRAINT `FK_159fe4dce7a605dac861d6f9320` FOREIGN KEY (`sub_category_id`) REFERENCES `reglementation_sub_category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `activity_entry_result_iso` ADD CONSTRAINT `FK_ffa083749724dc5c2d88ebb4e43` FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `activity_entry_result_ghg` ADD CONSTRAINT `FK_9a13b242b6474fb6eb83cb29467` FOREIGN KEY (`activity_entry_id`) REFERENCES `activity_entry`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `activity_entry_result_ghg` ADD CONSTRAINT `FK_c8d0f2beb640329b424cf187caa` FOREIGN KEY (`sub_category_id`) REFERENCES `reglementation_sub_category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `activity_entry_result_ghg` ADD CONSTRAINT `FK_2ae44d9e72aafdc74e609836813` FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");

        await queryRunner.query("UPDATE reglementation_sub_category_mappings_for_exceptions SET table_code = 'BEGES' WHERE id=1");
        await queryRunner.query("UPDATE reglementation_sub_category_mappings_for_exceptions SET table_code = 'GHG' WHERE id=2");
        await queryRunner.query("UPDATE reglementation_sub_category_mappings_for_exceptions SET table_code = 'ISO' WHERE id=3");

        const qb = getConnection().createQueryBuilder(ActivityEntry, "ae")
          .leftJoinAndSelect("ae.activity", "a")
          .leftJoinAndSelect("a.activityModel", "am")
          .leftJoinAndSelect("ae.emissionFactor", "ef")
          .where("ae.softDeletedAt IS NULL")

        const allEntries = await qb.getMany();
        console.log(`${allEntries.length} activityEntries loaded`);

        for (let i = 0; i < allEntries.length; i++) {
          const entry = allEntries[i];
          await Promise.all([
            activityEntryResultISOManager.saveOrUpdateResult(entry),
            activityEntryResultGHGManager.saveOrUpdateResult(entry),
            activityEntryResultBEGESManager.saveOrUpdateResult(entry),
          ]);
          console.log(i)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_entry_result_ghg` DROP FOREIGN KEY `FK_2ae44d9e72aafdc74e609836813`");
        await queryRunner.query("ALTER TABLE `activity_entry_result_ghg` DROP FOREIGN KEY `FK_c8d0f2beb640329b424cf187caa`");
        await queryRunner.query("ALTER TABLE `activity_entry_result_ghg` DROP FOREIGN KEY `FK_9a13b242b6474fb6eb83cb29467`");
        await queryRunner.query("ALTER TABLE `activity_entry_result_iso` DROP FOREIGN KEY `FK_ffa083749724dc5c2d88ebb4e43`");
        await queryRunner.query("ALTER TABLE `activity_entry_result_iso` DROP FOREIGN KEY `FK_159fe4dce7a605dac861d6f9320`");
        await queryRunner.query("ALTER TABLE `activity_entry_result_iso` DROP FOREIGN KEY `FK_d9d3feaa7f8dc4e4ec36cc1b824`");
        await queryRunner.query("ALTER TABLE `activity_entry_result_beges` DROP FOREIGN KEY `FK_442a493e84bf43296ee3183e99a`");
        await queryRunner.query("ALTER TABLE `activity_entry_result_beges` DROP FOREIGN KEY `FK_c593c3f7254483509d56eafdce8`");
        await queryRunner.query("ALTER TABLE `activity_entry_result_beges` DROP FOREIGN KEY `FK_4c79422b53e0a7836e33d17882a`");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `target` `target` float NULL");
        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `description` `description` text NULL");
        await queryRunner.query("ALTER TABLE `reglementation_sub_category_mappings_for_exceptions` DROP COLUMN `table_code`");
        await queryRunner.query("DROP TABLE `activity_entry_result_ghg`");
        await queryRunner.query("DROP TABLE `activity_entry_result_iso`");
        await queryRunner.query("DROP TABLE `activity_entry_result_beges`");
    }

}

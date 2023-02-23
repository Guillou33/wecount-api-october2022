import {MigrationInterface, QueryRunner} from "typeorm";

export class tagsManyToMany1652428270715 implements MigrationInterface {
    name = 'tagsManyToMany1652428270715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` DROP FOREIGN KEY `FK_3b0c166616c3bbe19e095bb3c2f`");
        await queryRunner.query("CREATE TABLE `emission_factor_tag_label_relation` (`id` int NOT NULL AUTO_INCREMENT, `parent_tag_id` int NOT NULL, `child_tag_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` DROP COLUMN `parent_label_id`");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label_relation` ADD CONSTRAINT `FK_31cc5df8d2fd2b44ad52864b152` FOREIGN KEY (`parent_tag_id`) REFERENCES `emission_factor_tag_label`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label_relation` ADD CONSTRAINT `FK_59f15fa5d70d477e294b5a968e5` FOREIGN KEY (`child_tag_id`) REFERENCES `emission_factor_tag_label`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label_relation` DROP FOREIGN KEY `FK_59f15fa5d70d477e294b5a968e5`");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label_relation` DROP FOREIGN KEY `FK_31cc5df8d2fd2b44ad52864b152`");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` ADD `parent_label_id` int NULL");
        await queryRunner.query("DROP TABLE `emission_factor_tag_label_relation`");
        await queryRunner.query("ALTER TABLE `emission_factor_tag_label` ADD CONSTRAINT `FK_3b0c166616c3bbe19e095bb3c2f` FOREIGN KEY (`parent_label_id`, `parent_label_id`) REFERENCES `emission_factor_tag_label`(`id`,`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}

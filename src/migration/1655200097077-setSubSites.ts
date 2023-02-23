import {MigrationInterface, QueryRunner} from "typeorm";

export class setSubSites1655200097077 implements MigrationInterface {
    name = 'setSubSites1655200097077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `site_closure` (`id_ancestor` int NOT NULL, `id_descendant` int NOT NULL, INDEX `IDX_efd5e983f4e7f0aeeea699c911` (`id_ancestor`), INDEX `IDX_d997a34724f3d69d1c64025169` (`id_descendant`), PRIMARY KEY (`id_ancestor`, `id_descendant`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `site` ADD `site_parent_id` int NULL");
        await queryRunner.query("ALTER TABLE `site` ADD CONSTRAINT `FK_af2ebc187fb357e7e531aeef60e` FOREIGN KEY (`site_parent_id`) REFERENCES `site`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `site_closure` ADD CONSTRAINT `FK_efd5e983f4e7f0aeeea699c9115` FOREIGN KEY (`id_ancestor`) REFERENCES `site`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `site_closure` ADD CONSTRAINT `FK_d997a34724f3d69d1c640251690` FOREIGN KEY (`id_descendant`) REFERENCES `site`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `site_closure` DROP FOREIGN KEY `FK_d997a34724f3d69d1c640251690`");
        await queryRunner.query("ALTER TABLE `site_closure` DROP FOREIGN KEY `FK_efd5e983f4e7f0aeeea699c9115`");
        await queryRunner.query("ALTER TABLE `site` DROP FOREIGN KEY `FK_af2ebc187fb357e7e531aeef60e`");
        await queryRunner.query("ALTER TABLE `site` DROP COLUMN `site_parent_id`");
        await queryRunner.query("DROP INDEX `IDX_d997a34724f3d69d1c64025169` ON `site_closure`");
        await queryRunner.query("DROP INDEX `IDX_efd5e983f4e7f0aeeea699c911` ON `site_closure`");
        await queryRunner.query("DROP TABLE `site_closure`");
    }

}

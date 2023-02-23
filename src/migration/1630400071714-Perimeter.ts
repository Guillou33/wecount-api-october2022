import {MigrationInterface, QueryRunner} from "typeorm";

export class Perimeter1630400071714 implements MigrationInterface {
    name = 'Perimeter1630400071714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `perimeter` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `soft_deleted_at` datetime(6) NULL, `company_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `campaign` ADD `perimeter_id` int NULL");
        await queryRunner.query("ALTER TABLE `campaign` ADD CONSTRAINT `FK_5ab7bbb0303d5fce762deb86ca5` FOREIGN KEY (`perimeter_id`) REFERENCES `perimeter`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `perimeter` ADD CONSTRAINT `FK_744881640e10107248d00f31cc0` FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");

        const companies = await queryRunner.query("SELECT * FROM company");

        for(let i=0 ; i<companies.length ; i++){
            const company = companies[i];
            await queryRunner.query(`INSERT INTO perimeter (name, company_id) VALUES ('${company.name}', ${company.id})`)
        }

        const campaigns = await queryRunner.query("SELECT * FROM campaign");

        for(let i=0 ; i<campaigns.length ; i++){
            const campaign = campaigns[i];
            const perimeter = await queryRunner.query(`SELECT * FROM perimeter WHERE company_id=${campaign.company_id}`);
            await queryRunner.query(`UPDATE campaign SET perimeter_id=${perimeter[0].id} WHERE id=${campaign.id}`)
        }

        const foreignKey = await queryRunner.query(`SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME =  'campaign' AND COLUMN_NAME =  'company_id'`);

        await queryRunner.query(`ALTER TABLE campaign DROP FOREIGN KEY ${foreignKey[0].CONSTRAINT_NAME}`)
        await queryRunner.query("ALTER TABLE campaign DROP COLUMN company_id")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `perimeter` DROP FOREIGN KEY `FK_744881640e10107248d00f31cc0`");
        await queryRunner.query("ALTER TABLE `campaign` DROP FOREIGN KEY `FK_5ab7bbb0303d5fce762deb86ca5`");
        await queryRunner.query("ALTER TABLE `campaign` DROP COLUMN `perimeter_id`");
        await queryRunner.query("DROP TABLE `perimeter`");
    }

}

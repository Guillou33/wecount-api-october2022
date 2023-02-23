import {MigrationInterface, QueryRunner} from "typeorm";

export class SitesProductsInPerimeter1630420921784 implements MigrationInterface {
    name = 'SitesProductsInPerimeter1630420921784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `site` ADD `perimeter_id` int NULL");
        await queryRunner.query("ALTER TABLE `product` ADD `perimeter_id` int NULL");
        await queryRunner.query("ALTER TABLE `site` ADD CONSTRAINT `FK_71042d0350ce5b7774ce9b14b0c` FOREIGN KEY (`perimeter_id`) REFERENCES `perimeter`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `product` ADD CONSTRAINT `FK_4f15b50ab2176196d8b51425d29` FOREIGN KEY (`perimeter_id`) REFERENCES `perimeter`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");


        const sites = await queryRunner.query("SELECT * FROM site");
        for(let i=0 ; i<sites.length ; i++){
            const site = sites[i];
            const perimeter = (await queryRunner.query(`SELECT * FROM perimeter WHERE company_id=${site.company_id}`))[0]

            await queryRunner.query(`UPDATE site SET perimeter_id=${perimeter.id} WHERE id=${site.id}`)
        }

        const products = await queryRunner.query("SELECT * FROM product");
        for(let i=0 ; i<products.length ; i++){
            const product = products[i];
            const perimeter = (await queryRunner.query(`SELECT * FROM perimeter WHERE company_id=${product.company_id}`))[0]

            await queryRunner.query(`UPDATE product SET perimeter_id=${perimeter.id} WHERE id=${product.id}`)
        }

        const sitesForeignKey = await queryRunner.query(`SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME =  'site' AND COLUMN_NAME =  'company_id'`);
        const productsForeignKey = await queryRunner.query(`SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME =  'product' AND COLUMN_NAME =  'company_id'`);

        await queryRunner.query(`ALTER TABLE site DROP FOREIGN KEY ${sitesForeignKey[0].CONSTRAINT_NAME}`);
        await queryRunner.query(`ALTER TABLE product DROP FOREIGN KEY ${productsForeignKey[0].CONSTRAINT_NAME}`);

        await queryRunner.query("ALTER TABLE site DROP COLUMN company_id")
        await queryRunner.query("ALTER TABLE product DROP COLUMN company_id")

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class bugfix1648474151940 implements MigrationInterface {
    name = 'bugfix1648474151940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `UniqueByCampaignAndActivityModel` ON `activity`");
        await queryRunner.query("CREATE UNIQUE INDEX `UniqueByCampaignAndActivityModel` ON `activity` (`activity_model_id`, `campaign_id`, `soft_deleted_at`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `UniqueByCampaignAndActivityModel` ON `activity`");
        await queryRunner.query("CREATE UNIQUE INDEX `UniqueByCampaignAndActivityModel` ON `activity` (`activity_model_id`, `campaign_id`)");
    }

}

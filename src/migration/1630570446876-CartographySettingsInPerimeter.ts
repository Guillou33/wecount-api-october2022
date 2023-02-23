import {MigrationInterface, QueryRunner} from "typeorm";

export class CartographySettingsInPerimeter1630570446876 implements MigrationInterface {
    name = 'CartographySettingsInPerimeter1630570446876'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity_model_preference` DROP FOREIGN KEY `FK_862ed946e9232b1b311455d5faf`");
        await queryRunner.query("DROP INDEX `REL_862ed946e9232b1b311455d5fa` ON `activity_model_preference`");

        const activityModelPreferencesWithPerimeter = await queryRunner.query(
          "SELECT amp.id, amp.company_id, p.id as 'perimeter_id' FROM activity_model_preference amp JOIN perimeter p ON amp.company_id=p.company_id"
        );

        await queryRunner.query("ALTER TABLE `activity_model_preference` CHANGE `company_id` `perimeter_id` int NULL");

        for(const activityModelPrefWithPerimeter of activityModelPreferencesWithPerimeter){
            await queryRunner.query(
              `UPDATE activity_model_preference SET perimeter_id=${activityModelPrefWithPerimeter.perimeter_id} WHERE id=${activityModelPrefWithPerimeter.id}`
            );
        }
        
        await queryRunner.query("ALTER TABLE `activity_model_preference` ADD UNIQUE INDEX `IDX_75039c6564a7f4ab898b303816` (`perimeter_id`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_75039c6564a7f4ab898b303816` ON `activity_model_preference` (`perimeter_id`)");
        await queryRunner.query("ALTER TABLE `activity_model_preference` ADD CONSTRAINT `FK_75039c6564a7f4ab898b303816b` FOREIGN KEY (`perimeter_id`) REFERENCES `perimeter`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

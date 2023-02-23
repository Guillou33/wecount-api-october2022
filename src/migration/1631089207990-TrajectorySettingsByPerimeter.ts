import {MigrationInterface, QueryRunner} from "typeorm";

export class TrajectorySettingsByPerimeter1631089207990 implements MigrationInterface {
    name = 'TrajectorySettingsByPerimeter1631089207990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const perimeters = await queryRunner.query("SELECT * FROM perimeter");

        await queryRunner.query("CREATE TABLE `trajectory_settings` (`id` int NOT NULL AUTO_INCREMENT, `target_year` year NULL, `perimeter_id` int NULL, UNIQUE INDEX `REL_30d59674078a384f4888ead481` (`perimeter_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");

        const scopeTargetsToInsert = [];
        const targetYearsToUpdate = [];

        for(const perimeter of perimeters){
            await queryRunner.query(`INSERT INTO trajectory_settings (perimeter_id) VALUES (${perimeter.id})`);
            const trajectorySettings = await queryRunner.query(`SELECT * FROM trajectory_settings WHERE perimeter_id=${perimeter.id}`);

            const campaigns = await queryRunner.query(`SELECT * FROM campaign WHERE perimeter_id=${perimeter.id} AND soft_deleted_at IS NULL ORDER BY created_at`)
            const oldestCampaign = campaigns[0];

            if(oldestCampaign != null){
                const scopeTargets = await queryRunner.query(`SELECT * FROM scope_target st JOIN campaign_trajectory ct ON st.campaign_trajectory_id=ct.id WHERE ct.campaign_id=${oldestCampaign.id}`)
                scopeTargets.forEach((scopeTarget: any) => {
                    scopeTarget.trajectory_settings_id = trajectorySettings[0].id;
                });
    
                scopeTargetsToInsert.push(...scopeTargets);
                targetYearsToUpdate.push({
                  trajectorySettingsId: trajectorySettings[0].id,
                  year: oldestCampaign.target_year,
                });
            }
            
        }

        await queryRunner.query("ALTER TABLE `scope_target` DROP FOREIGN KEY `FK_2e3786b51d6ab0084c2362df75a`");
        await queryRunner.query("ALTER TABLE `scope_target` DROP INDEX `FK_2e3786b51d6ab0084c2362df75a`");

        await queryRunner.query("ALTER TABLE `scope_target` CHANGE `campaign_trajectory_id` `trajectory_settings_id` int NULL");

        await queryRunner.query("TRUNCATE TABLE scope_target");

        for(const scopeTarget of scopeTargetsToInsert){
            await queryRunner.query(`INSERT INTO scope_target (scope, description, target, trajectory_settings_id) VALUES ('${scopeTarget.scope}', ${scopeTarget.description != null ? `'${scopeTarget.description}'` : null},${scopeTarget.target}, ${scopeTarget.trajectory_settings_id})`);
        }

        for(const targetYear of targetYearsToUpdate){
            await queryRunner.query(`UPDATE trajectory_settings SET target_year=${targetYear.year} WHERE id=${targetYear.trajectorySettingsId}`)
        }

        await queryRunner.query("ALTER TABLE `scope_target` ADD CONSTRAINT `FK_ee9dde43834f85f540be51e3c26` FOREIGN KEY (`trajectory_settings_id`) REFERENCES `trajectory_settings`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `trajectory_settings` ADD CONSTRAINT `FK_30d59674078a384f4888ead4814` FOREIGN KEY (`perimeter_id`) REFERENCES `perimeter`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

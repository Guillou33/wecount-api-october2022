import {MigrationInterface, QueryRunner} from "typeorm";

export class fixTrajectorySettingsMigration1632211979324 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const orphanTrajectorySettings = await queryRunner.query(
          "SELECT ts.id FROM trajectory_settings ts LEFT JOIN scope_target st ON st.trajectory_settings_id=ts.id WHERE st.id IS NULL"
        );

        for(const trajectorySetting of orphanTrajectorySettings){
            await queryRunner.query(
              `INSERT INTO scope_target (scope, trajectory_settings_id) VALUES 
              ('UPSTREAM', ${trajectorySetting.id}),
              ('CORE', ${trajectorySetting.id}),
              ('DOWNSTREAM', ${trajectorySetting.id})`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

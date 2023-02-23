import config from "config";
import {createConnection, createConnections, Connection} from "typeorm";
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { timeout } from "@service/utils/timeout";

const dbConfig: {
  type: any,
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
  entities: string[],
  migrations: string[],
  cli: {
    migrationsDir: string
  },
  logging?: boolean,
  dropSchema?: boolean,
  [key: string]: any
} = config.get('db');

export default class SqlConnection {
  private static instance: Connection;
  private static isSettingInstance = false;

  static async setInstance(name: string = 'default'): Promise<Connection> {
    SqlConnection.isSettingInstance = true;

    try {
      SqlConnection.instance = await createConnection({
        name,
        type: dbConfig.type,
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        entities: dbConfig.entities,
        // migrations: dbConfig.migrations,
        // cli: {
        //     migrationsDir: dbConfig.cli.migrationsDir
        // },
        namingStrategy: new SnakeNamingStrategy(),
        logging: dbConfig.logging ? dbConfig.logging : false,
        dropSchema: dbConfig.dropSchema ? dbConfig.dropSchema : false
      });
    } catch (e) {
      SqlConnection.isSettingInstance = false;
      throw e;
    }

    SqlConnection.isSettingInstance = false;

    return SqlConnection.instance;
  }

  static async getInstance(force: boolean = false): Promise<Connection> {
    if (SqlConnection.isSettingInstance) {
      if (force) {
        throw new Error("Unable to establish mysql connection after 1 sec wait");
      }
      await timeout(1000);
      return this.getInstance(true);
    }
    if (!SqlConnection.instance) {
      await SqlConnection.setInstance();
    }
    return SqlConnection.instance;
  }
}

const config = require("config");
const { SnakeNamingStrategy } = require("typeorm-naming-strategies");

const dbConfig = config.get('db');

module.exports = {
  type: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: dbConfig.entities,
  migrations: dbConfig.migrations,
  cli: {
      migrationsDir: dbConfig.cli.migrationsDir
  },
  namingStrategy: new SnakeNamingStrategy(),
  logging: false,
  dropSchema: dbConfig.dropSchema ? dbConfig.dropSchema : false
}
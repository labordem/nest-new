import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { environment } from './environment';

const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: environment.dbHost,
  port: environment.dbPort,
  username: environment.dbUser,
  password: environment.dbPassword,
  database: environment.dbName,
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  // must be set to false once the first release deployed.
  synchronize: true,
  migrationsRun: true,
  logging: true,
  logger: 'file',
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  cli: {
    // should be inside src folder to be compiled into /dist.
    migrationsDir: 'src/migrations',
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export = connectionOptions;

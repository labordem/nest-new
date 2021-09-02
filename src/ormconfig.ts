import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { environment } from './environment';

const isHostedByHeroku = !!environment.databaseUrl;

const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  url: isHostedByHeroku
    ? environment.databaseUrl
    : `postgres://${environment.dbUser}:${environment.dbPassword}@${environment.dbHost}:${environment.dbPort}/${environment.dbName}`,
  ssl: isHostedByHeroku,
  extra: isHostedByHeroku ? { ssl: { rejectUnauthorized: false } } : {},
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

import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { environment } from './environment';

// Check typeORM documentation for more information
const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: environment.dbHost,
  port: environment.dbPort,
  username: environment.dbUser,
  password: environment.dbPassword,
  database: environment.dbName,
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  // We are using migrations, synchronize should be set to false in production
  synchronize: environment.nodeEnv !== 'production',
  // Run migrations automatically on start
  migrationsRun: false,
  logging: true,
  logger: 'file',
  // Allow 'npm run start' to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  cli: {
    // Location of migration should be inside src folder
    // to be compiled into dist/ folder.
    migrationsDir: 'src/migrations',
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export = connectionOptions;

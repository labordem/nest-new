import * as dotenv from 'dotenv';

dotenv.config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env'
      : `.env.${process.env.NODE_ENV as string}`,
});

/** Variables from your `.env.development` or `.env` file. */
export const environment = {
  nodeEnv: process.env.NODE_ENV as string,
  projectName: process.env.PROJECT_NAME as string,
  // API
  apiName: process.env.API_NAME as string,
  apiProtocol: process.env.API_PROTOCOL as string,
  apiHost: process.env.API_HOST as string,
  /** Used $API_PORT environment variable, or $PORT on some hosting services. */
  apiPort: parseInt((process.env.PORT || process.env.API_PORT) as string, 10),
  /** If an account is registered with this email then account has Admin role. */
  apiAdminEmail: process.env.API_ADMIN_EMAIL as string,
  /** Enable live documentation in production. */
  apiOpenapiEnabled: process.env.API_OPENAPI_ENABLED === 'true',
  apiUserJwtSecret: process.env.API_USER_JWT_SECRET as string,
  apiUserJwtExpirationTime: process.env.API_USER_JWT_EXPIRATION_TIME as string,
  apiEmailJwtSecret: process.env.API_EMAIL_JWT_SECRET as string,
  apiEmailJwtExpirationTime: process.env
    .API_EMAIL_JWT_EXPIRATION_TIME as string,
  // API_TRANSPORT
  apiTransportHost: process.env.API_TRANSPORT_HOST as string,
  apiTransportPort: parseInt(process.env.API_TRANSPORT_PORT as string, 10),
  apiTransportUser: process.env.API_TRANSPORT_USER as string,
  apiTransportPassword: process.env.API_TRANSPORT_PASSWORD as string,
  apiTransportFrom: process.env.API_TRANSPORT_FROM as string,
  apiTransportSecure: process.env.API_TRANSPORT_SECURE === 'true',
  // DB
  dbHost: process.env.DB_HOST as string,
  dbPort: parseInt(process.env.DB_PORT as string, 10),
  dbUser: process.env.DB_USER as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbName: process.env.DB_NAME as string,
  /** This variable is added by Heroku, if you do not use this service then this variable will not be used. */
  databaseUrl: process.env.DATABASE_URL,
  // ADMIN
  /** This port is used by adminer docker container, in development mode only */
  adminPort: parseInt(process.env.ADMIN_PORT as string, 10),
  // PWA
  pwaConfirmEmailUrl: process.env.PWA_CONFIRM_EMAIL_URL as string,
  pwaResetPasswordUrl: process.env.PWA_RESET_PASSWORD_URL as string,
};

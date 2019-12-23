import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config();

const envFound = dotenv.config();
if (!envFound) {
  console.info('No .env file specified, falling back to defaults');
}

export default {
    port: process.env.PORT || 3000,

    sentry: {
        active: process.env.SENTRY_REPORTING,
        dsn: process.env.SENTRY_DSN
    }
}
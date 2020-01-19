import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config();

const envFound = dotenv.config();
if (!envFound) {
  console.info('No .env file specified, falling back to defaults');
}

export default {
  port: process.env.PORT || 80,
  secret: process.env.secret || 'someawesomesecret',
  jwt_secret: process.env.JWT_SECRET || 'anotherawesomesecret',
  server: {
    secure: process.env.PORT === '443',
    certs: {
      basePath: process.env.SERVER_CERT_BASEPATH || '',
      key: process.env.SERVER_CERT_KEY || '',
      cert: process.env.SERVER_CERT_CERT || '',
      chain: process.env.SERVER_CERT_CHAIN || '',
    }
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER ||  'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'app'
  },
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID || '',
    clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
    callbackURL: process.env.TWITCH_CALLBACK_URL || '',
  }
}

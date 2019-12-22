import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Sentry from '@sentry/node';
const {PORT = 3000, SENTRY_REPORTING = false, SENTRY_DSN = ''} = process.env;

if(SENTRY_REPORTING) {
    Sentry.init({ dsn: SENTRY_DSN});
}

export const app = express();

app.route('/').get((req, res) => res.send('Welcome to shokz.tv-v2 API').end());

app.listen(PORT);
console.log('REST Server started on: ' + PORT + ', with' + (!SENTRY_REPORTING ? 'out' : '') + ' error reporting.');
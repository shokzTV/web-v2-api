import express from 'express';
import dotenv from 'dotenv';
import Sentry from '@sentry/node';
dotenv.config();
const {PORT = 3000, SENTRY_REPORTING = false, SENTRY_DSN = ''} = process.env;

if(SENTRY_REPORTING) {
    Sentry.init({ dsn: SENTRY_DSN});
}

const app = express();

if(SENTRY_REPORTING) {
    app.use(Sentry.Handlers.requestHandler());
}

app.route('/')
   .get((req, res) => res.send('Welcome to shokz.tv-v2 API'));

if(SENTRY_REPORTING) {
    app.use(Sentry.Handlers.errorHandler());
}

app.listen(PORT);
console.log('REST Server started on: ' + PORT + ', with' + (!SENTRY_REPORTING ? 'out' : '') + ' error reporting.');
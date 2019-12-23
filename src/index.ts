import config from './config';
import express from 'express';
import Sentry from '@sentry/node';

/* istanbul ignore next */
if(config.sentry.active) {
    Sentry.init({ dsn: config.sentry.dsn});
}

async function startServer() {
    const app = express();
    await require('./loaders').default({ app });

    app.listen(config.port);
    console.log(`API started on: ${config.port}, with${!config.sentry.active ? 'out' : ''} error reporting.`);
}

startServer();
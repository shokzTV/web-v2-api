import express from 'express';
import bodyParser from 'body-parser';
import routes from '../api';
import config from '../config';
import Sentry from '@sentry/node';

export default async ({ app }: { app: express.Application }) => {
    /* istanbul ignore next */
    if(config.sentry.active) {
        app.use(Sentry.Handlers.requestHandler());
    }

    /** health check endpoints */
    app.get('/status', (req, res) => res.status(200).end());
    app.head('/status', (req, res) => res.status(200).end());

    app.use(bodyParser.json());
    app.use(routes());

    /* istanbul ignore next */
    if(config.sentry.active) {
        app.use(Sentry.Handlers.errorHandler());
    }
};
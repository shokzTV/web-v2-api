import express from 'express';
import bodyParser from 'body-parser';
import routes from '../api';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import config from '../config';
import passport from 'passport';

export default async ({ app }: { app: express.Application }) => {
    app.use(cors());

    app.use('/static', express.static('static'));

    /** health check endpoints */
    app.get('/status', (req, res) => res.status(200).end());
    app.head('/status', (req, res) => res.status(200).end());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(cookieSession({secret: config.secret}));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(routes());
};

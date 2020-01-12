import express from 'express';
import bodyParser from 'body-parser';
import routes from '../api';
import cors from 'cors';
import {PassportStatic} from 'passport';
import fileUpload from 'express-fileupload';


export default async ({ app, passport }: { app: express.Application; passport: PassportStatic}) => {
    app.use(cors());
    app.use(fileUpload());

    app.use('/static', express.static('static'));

    /** health check endpoints */
    app.get('/status', (req, res) => res.status(200).end());
    app.head('/status', (req, res) => res.status(200).end());

    app.use(bodyParser.json());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(routes({passport}));
};

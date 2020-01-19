import express from 'express';
import {PassportStatic} from 'passport';
import {Strategy}  from 'passport-twitch-new';
import config from '../config';
import authRoutes from '../api/routes/auth';
import { findOrCreateUser } from '../services/user';

export default async ({ app, passport }: { app: express.Application, passport: PassportStatic }) => {
    passport.use(new Strategy({
        clientID: config.twitch.clientId,
        clientSecret: config.twitch.clientSecret,
        callbackURL: "https://admin-shokz.grief.dev/auth",
        scope: ""
    },
    async (accessToken, refreshToken, profile, done) => {
        let error = null;
        let user = null;
        try {
            user = await findOrCreateUser(+profile.id, profile.display_name, profile.profile_image_url);
        } catch(err) {
            error = err;
        }
        done(error, user);
    }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    authRoutes(app, passport);
};

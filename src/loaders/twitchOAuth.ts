import express from 'express';
import passport from 'passport';
import {Strategy}  from 'passport-twitch-new';
import config from '../config';
import authRoutes from '../api/routes/auth';
import { findOrCreateUser } from '../services/user';

export default async ({ app }: { app: express.Application }) => {
    passport.use(new Strategy({
        clientID: config.twitch.clientId,
        clientSecret: config.twitch.clientSecret,
        callbackURL: "http://localhost/auth/twitch/callback",
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

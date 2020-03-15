import express from 'express';
import expressLoader from './express';
import twitchOAuthLoader from './twitchOAuth';
import jwtVerify from './jwtVerify';
import anonymous from './anonymous';
import {PassportStatic} from 'passport';
import {cyan} from 'chalk';

export default async ({ app, passport}: {app: express.Application, passport: PassportStatic}) => {
    await expressLoader({ app, passport });
    console.info(cyan('🔌 Express loaded'));

    await twitchOAuthLoader({ app, passport });
    console.info(cyan('🔒 Twitch OAuth registered'));

    await jwtVerify({passport});
    console.info(cyan('🔒 JWT authorization registered'));

    await anonymous({passport});
    console.info(cyan('🔒 Anonymous users plugin registered'));
};

import express from 'express';
import expressLoader from './express';
import twitchOAuthLoader from './twitchOAuth';
import jwtVerify from './jwtVerify';
import anonymous from './anonymous';
import {PassportStatic} from 'passport';

export default async ({ app, passport}: {app: express.Application, passport: PassportStatic}) => {
    await expressLoader({ app, passport });
    console.info('✌ Express loaded');

    await twitchOAuthLoader({ app, passport });
    console.info('🔒 Twitch OAuth registered');

    await jwtVerify({passport});
    console.info('🔒 JWT authorization loaded');

    await anonymous({passport});
    console.info('🔒 Anonymous users allowed');
};

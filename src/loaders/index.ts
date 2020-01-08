import express from 'express';
import expressLoader from './express';
import twitchOAuthLoader from './twitchOAuth';

export default async ({ app }: {app: express.Application}) => {
    await expressLoader({ app });
    console.info('✌ Express loaded');

    await twitchOAuthLoader({ app });
    console.info('🔒 Twitch OAuth registered');
};

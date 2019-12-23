import express from 'express';
import expressLoader from './express';

export default async ({ app }: {app: express.Application}) => {
    await expressLoader({ app });
    console.info('✌️ Express loaded');
};
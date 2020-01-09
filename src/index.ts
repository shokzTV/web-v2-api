import config from './config';
import express from 'express';
import fs from 'fs';
import https from 'https';
import passport from 'passport';
import http from 'http';

let key: string;
let cert: string;
let ca: string;

if(config.server.secure) {
    key = fs.readFileSync(config.server.certs.basePath + config.server.certs.key, 'utf8');
    cert = fs.readFileSync(config.server.certs.basePath + config.server.certs.cert, 'utf8');
    ca = fs.readFileSync(config.server.certs.basePath + config.server.certs.chain, 'utf8');
}

async function startServer() {
    const app = express();
    await require('./loaders').default({ app, passport });

    const server  = config.server.secure ? https.createServer({key, cert, ca}, app) : http.createServer(app);
    server.listen(config.port, () => {
        console.log(`API started on: ${config.port}`);
    });
}

startServer();

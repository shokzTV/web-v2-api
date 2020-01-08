import { Router, Request, Response } from 'express';
import {PassportStatic} from 'passport';

const route = Router();

export default (app: Router, passport: PassportStatic) => {
    app.use('/auth', route);

    route.get('/user', (req: Request, res: Response) => {
        console.log(req.user);
        return res.json(req.user).status(200);
    });

    route.get("/twitch", passport.authenticate("twitch"));
    route.get("/twitch/callback", passport.authenticate("twitch", { failureRedirect: "/" }), (req: Request, res: Response) => {
        return res.json('success').status(200);
    });
};

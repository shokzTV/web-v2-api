import { Router, Request, Response } from 'express';
import { getRights } from '../../services/rights';

const route = Router();

export default (app: Router) => {
    app.use('/right', route);

    route.get('/list', async (req: Request, res: Response) => {
        //TODO: validate user rights
        const rights = await getRights();
        return res.json(rights).status(200);
    });
};

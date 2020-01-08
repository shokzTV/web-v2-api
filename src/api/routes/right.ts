import { Router, Request, Response } from 'express';
import { getRights } from '../../services/right';
import { checkUserRole } from '../../middlewares/access';

const route = Router();

export default (app: Router) => {
    app.use('/right', checkUserRole('ADMIN_ACCESS'), route);

    route.get('/list', async (req: Request, res: Response) => {
        const rights = await getRights();
        return res.json(rights).status(200);
    });
};

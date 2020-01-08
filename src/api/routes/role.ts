import { Router, Request, Response } from 'express';
import { getRoles, createRole, assignRight, removeRight } from '../../services/role';
import { checkUserRole } from '../../middlewares/access';

const route = Router();

export default (app: Router) => {
    app.use('/role', checkUserRole('ADMIN_ACCESS'), route);

    route.get('/list', async (req: Request, res: Response) => {
        const roles = await getRoles();
        return res.json(roles).status(200);
    });

    route.post('/create', async (req: Request, res: Response) => {
        await createRole(req.body.name);
        return res.json('success').status(201);
    });

    route.put('/assignRight/:roleId/:rightId', async (req: Request, res: Response) => {
        await assignRight(+req.params.roleId, +req.params.rightId);
        return res.json('success').status(204);
    });

    route.delete('/removeRight/:roleId/:rightId', async (req: Request, res: Response) => {
        await removeRight(+req.params.roleId, +req.params.rightId);
        return res.json('success').status(204);
    });
};

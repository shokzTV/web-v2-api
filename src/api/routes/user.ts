import { Router, Request, Response } from 'express';
import { loadUsers, updateUserRole } from '../../services/user';
import { checkUserRole } from '../../middlewares/access';
const route = Router();

export default (app: Router) => {
  app.use('/user', route);

  route.get('/list', checkUserRole('ADMIN_ACCESS'), async (req: Request, res: Response) => {
      const users = await loadUsers();
      return res.json(users).status(200);
  });

  route.patch('/role/:userId', checkUserRole('ADMIN_ACCESS'), async (req: Request, res: Response) => {
    await updateUserRole(+req.params.userId, +req.body.roleId);
    return res.send().status(204);
  });
};

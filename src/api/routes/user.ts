import { Router, Request, Response } from 'express';
import { loadUsers, updateUserRole } from '../../services/user';
const route = Router();

export default (app: Router) => {
  app.use('/user', route);

  route.get('/list', async (req: Request, res: Response) => {
      const users = await loadUsers();
      return res.json(users).status(200);
  });

  route.patch('/role/:userId', async (req: Request, res: Response) => {
    await updateUserRole(+req.params.userId, +req.body.roleId);
    return res.send().status(204);
  });
};

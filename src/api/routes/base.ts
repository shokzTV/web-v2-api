import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
const route = Router();

export default (app: Router) => {
  app.use('/', route);

  route.get('/', (req: Request, res: Response) => {
    return res.json({ msg: 'Welcome to shokz.tv api' }).status(200);
  });

  route.get('/version', async (req: Request, res: Response) => {
    const response = await fetch('https://gitlab.com/api/v4/projects/16127808/repository/commits/master');
    const {id} = await response.json();
    return res.json(id).status(200);
  });
};

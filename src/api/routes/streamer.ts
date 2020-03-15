import { Router, Request, Response } from 'express';
import { checkUserRole } from '../../middlewares/access';
import { getAllStreamer, getOnlineStreamer, createStreamer, removeStreamer } from '../../services/streamer';
const route = Router();

export default (app: Router) => {
  app.use('/streamer', route);

  route.get('/list', checkUserRole('ADMIN_ACCESS'), async (req: Request, res: Response) => {
      const streamer = await getAllStreamer();
      return res.json(streamer).status(200);
  });

  route.get('/online', async (req: Request, res: Response) => {
    const streamer = await getOnlineStreamer();
    return res.json(streamer).status(200);
  });

  route.post('/create', checkUserRole('STREAMER_CREATE'), async (req: Request, res: Response) => {
    const streamer = await createStreamer(req.body.name);
    return res.json(streamer).status(200);
  });

  route.delete('/remove/:streamerId', checkUserRole('STREAMER_REMOVE'), async (req: Request, res: Response) => {
    await removeStreamer(+req.params.streamerId);
    return res.send().status(204);
  });
};

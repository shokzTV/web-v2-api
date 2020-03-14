import { Router, Request, Response } from 'express';
import { checkUserRole } from '../../middlewares/access';
import { getAllStreamer, getOnlineStreamer, updateStreamerStatus, createStreamer, removeStreamer } from '../../services/streamer';
const route = Router();

export default (app: Router) => {
  app.use('/streamer', route);

  route.get('/list', checkUserRole('ADMIN_ACCESS'), async (req: Request, res: Response) => {
      const streamer = await getAllStreamer();
      return res.json(streamer).status(200);
  });

  route.patch('/online', checkUserRole('ADMIN_ACCESS'), async (req: Request, res: Response) => {
    const streamer = await getOnlineStreamer();
    return res.json(streamer).status(200);
  });

  route.patch('/create', checkUserRole('ADMIN_ACCESS'), async (req: Request, res: Response) => {
    const streamer = await createStreamer(req.body.name);
    return res.json(streamer).status(200);
  });

  route.patch('/updateStatus/:streamerId', checkUserRole('ADMIN_ACCESS'), async (req: Request, res: Response) => {
    await updateStreamerStatus(+req.params.streamerId, req.body.online, req.body.title, req.body.viewer, req.body.previewUrl);
    return res.send().status(204);
  });
  route.patch('/remove/:streamerId', checkUserRole('ADMIN_ACCESS'), async (req: Request, res: Response) => {
    await removeStreamer(+req.params.streamerId);
    return res.send().status(204);
  });
};

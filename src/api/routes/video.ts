import { Router, Request, Response } from 'express';
import { checkUserRole } from '../../middlewares/access';
import { createVideo, patchVideo, deleteVideo, listVideos } from '../../services/video';

const route = Router();

function getTags(tags: string | string[]): string[] {
    if(typeof tags === 'string') {
        return [tags];
    }
    return tags;
}

export default (app: Router) => {
    app.use('/video', route);

    route.get('/list', async (req: Request, res: Response) => {
        const videos = await listVideos()
        return res.json(videos).status(200);
    });

    route.post('/create', checkUserRole('VIDEO_CREATE'), async (req: Request, res: Response) => {
        const {title, source} = req.body;
        const videoId = await createVideo(title, source, getTags(req.body.tags));
        return res.json(videoId).status(201);
    });

    route.patch('/:videoId', checkUserRole('VIDEO_EDIT'), async (req: Request, res: Response) => {
        await patchVideo(+req.params.videoId, req.body.title, getTags(req.body.tags));
        return res.send().status(204);
    });

    route.delete('/:videoId', checkUserRole('VIDEO_EDIT'), async (req: Request, res: Response) => {
        await deleteVideo(+req.params.videoId);
        return res.send().status(204);
    });
};

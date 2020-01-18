import { Router, Request, Response } from 'express';
import { checkUserRole } from '../../middlewares/access';
import { getTags, patchTag, createTag, delTag } from '../../services/tag';
import { UploadedFile } from 'express-fileupload';

const route = Router();

export default (app: Router) => {
    app.use('/tag', route);

    route.get('/list', async (req: Request, res: Response) => {
        const tags = await getTags();
        return res.json(tags).status(200);
    });

    route.post('/create', checkUserRole('ARTICLE_EDIT'), async (req: Request, res: Response) => {
        const image = req.files ? req.files.image : null;
        const tag = await createTag(req.body.name, image as UploadedFile);
        return res.json(tag).status(201);
    });

    route.patch('/:tagId', checkUserRole('ARTICLE_EDIT'), async (req: Request, res: Response) => {
        const image = req.files ? req.files.image : null;
        await patchTag(+req.params.tagId,req.body.name, image as UploadedFile);
        return res.send().status(204);
    });

    route.delete('/:tagId', checkUserRole('ARTICLE_DELETE'), async (req: Request, res: Response) => {
        await delTag(+req.params.tagId);
        return res.send().status(204);
    });
};

import { Router, Request, Response } from 'express';
import { checkUserRole } from '../../middlewares/access';
import { getTags, patchTag, createTag } from '../../services/tag';
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
        await createTag(req.body.name, image as UploadedFile);
        return res.json().status(201);
    });

    route.patch('/:tagId', checkUserRole('ARTICLE_EDIT'), async (req: Request, res: Response) => {
        const image = req.files ? req.files.image : null;
        const tags = await patchTag(+req.params.tagId,req.body.name, image as UploadedFile);
        return res.json().status(204);
    });
};

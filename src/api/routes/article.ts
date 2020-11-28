import { Router, Request, Response } from 'express';
import { checkUserRole } from '../../middlewares/access';
import { UploadedFile } from 'express-fileupload';
import { User } from '../../entities/User';
import { createDraft, publishArticle, unpublishArticle, getArticles, patchArticle, getPublicArticles, getFeaturedArticles, deleteArticle, getPublicArticleSlugs } from '../../services/article';

const route = Router();

function getTags(tags: string | string[]): string[] {
    if(typeof tags === 'string') {
        return [tags];
    }
    return tags;
}

export default (app: Router) => {
    app.use('/article', route);

    route.get('/featuredArticles', async (req: Request, res: Response) => {
        const articles = await getFeaturedArticles();
        return res.json(articles).status(200);
    });

    route.get('/slugs', async (req: Request, res: Response) => {
        const slugs = await getPublicArticleSlugs();
        return res.json(slugs).status(200);
    });

    route.get('/bySlug', async (req: Request, res: Response) => {
        const slugs = req.query.slugs as string[];
        const articles = await getPublicArticles(slugs);
        return res.json(articles).status(200);
    });

    route.get('/list', checkUserRole('ARTICLE_CREATE'), async (req: Request, res: Response) => {
        const articles = await getArticles([]);
        return res.json(articles).status(200);
    });

    route.post('/create', checkUserRole('ARTICLE_CREATE'), async (req: Request, res: Response) => {
        const userId = (req.user! as User).id;
        const cover = req.files && req.files.cover ? req.files.cover as UploadedFile : null;
        const {title, body, slug = ''} = req.body;
        const articleId = await createDraft(title, body, slug, getTags(req.body.tags), userId, cover);
        return res.json(articleId).status(201);
    });

    route.patch('/:articleId', checkUserRole('ARTICLE_EDIT'), async (req: Request, res: Response) => {
        const cover = req.files && req.files.cover ? req.files.cover as UploadedFile : null;
        await patchArticle(+req.params.articleId, req.body.title, req.body.body, req.body.slug, getTags(req.body.tags), cover);
        return res.send().status(204);
    });

    route.patch('/:articleId/publish', checkUserRole('ARTICLE_PUBLISH'), async (req: Request, res: Response) => {
        await publishArticle(+req.params.articleId);
        return res.send().status(204);
    });

    route.patch('/:articleId/unpublish', checkUserRole('ARTICLE_UNPUBLISH'), async (req: Request, res: Response) => {
        await unpublishArticle(+req.params.articleId);
        return res.send().status(204);
    });

    route.delete('/:articleId', checkUserRole('ARTICLE_DELETE'), async (req: Request, res: Response) => {
        await deleteArticle(+req.params.articleId);
        return res.send().status(204);
    });
};

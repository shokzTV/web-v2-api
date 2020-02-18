import { Router, Request, Response } from 'express';
import { checkUserRole } from '../../middlewares/access';
import { getNews, createNews, editNews, deleteNews } from '../../services/news';
import { User } from '../../entities/User';

const route = Router();

export default (app: Router) => {
    app.use('/news', route);

    route.get('/list', async (req: Request, res: Response) => {
        const news = await getNews();
        return res.json(news).status(200);
    });

    route.post('/create', checkUserRole('NEWS_CREATE'), async (req: Request, res: Response) => {
        const userId = (req.user! as User).id;
        const {name, description, source} = req.body;
        const newsId = await createNews(name, description, source, userId);
        return res.json(newsId).status(201);
    });

    route.patch('/:newsId', checkUserRole('NEWS_EDIT'), async (req: Request, res: Response) => {
        const {name, description, source} = req.body;
        await editNews(+req.params.newsId, name, description, source);
        return res.send().status(204);
    });

    route.delete('/:newsId', checkUserRole('NEWS_DELETE'), async (req: Request, res: Response) => {
        await deleteNews(+req.params.newsId);
        return res.send().status(204);
    });
};

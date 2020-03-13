import { Router } from 'express';
import baseRoutes from './routes/base';
import rightRoutes from './routes/right';
import roleRoutes from './routes/role';
import tagRoutes from './routes/tag';
import articleRoutes from './routes/article';
import videoRoutes from './routes/video';
import organizerRoutes from './routes/organizer';
import eventRoutes from './routes/event';
import newsRoute from './routes/news';
import userRoute from './routes/user';
import { PassportStatic } from 'passport';

export default ({passport}: {passport: PassportStatic}) => {
	const app = Router();
	app.use(passport.authenticate(['jwt', 'anonymous'], { session: false }));

	baseRoutes(app);
	roleRoutes(app);
	rightRoutes(app);
	tagRoutes(app);
	articleRoutes(app);
	videoRoutes(app);
	organizerRoutes(app);
	eventRoutes(app);
	newsRoute(app);
	userRoute(app);
	
	return app;
}

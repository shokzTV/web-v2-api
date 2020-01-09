import { Router } from 'express';
import baseRoutes from './routes/base';
import rightRoutes from './routes/right';
import roleRoutes from './routes/role';
import { PassportStatic } from 'passport';

export default ({passport}: {passport: PassportStatic}) => {
	const app = Router();
	app.use(passport.authenticate(['jwt', 'anonymous'], { session: false }));

	baseRoutes(app);
	roleRoutes(app);
	rightRoutes(app);
	
	return app;
}

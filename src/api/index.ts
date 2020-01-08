import { Router } from 'express';
import baseRoutes from './routes/base';
import rightRoutes from './routes/right';
import roleRoutes from './routes/role';

export default () => {
	const app = Router();

	baseRoutes(app);
	roleRoutes(app);
	rightRoutes(app);
	
	return app;
}

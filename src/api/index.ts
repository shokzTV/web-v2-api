import { Router } from 'express';
import baseRoutes from './routes/index'

export default () => {
	const app = Router();

	baseRoutes(app);
	
	return app;
}
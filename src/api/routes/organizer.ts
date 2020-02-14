import { Router, Request, Response } from 'express';
import { getOrganizer, createOrganizer, updateOrganizer, deleteOrganizer } from '../../services/organizer';
import { getIdsFromRequest } from './helper';
import { UploadedFile } from 'express-fileupload';

const route = Router();

export default (app: Router) => {
    app.use('/organizer', route);

    route.get('/list', async (req: Request, res: Response) => {
        const ids = getIdsFromRequest(req);
        const organizer = await getOrganizer(ids);
        return res.json(organizer).status(200);
    });

    route.post('/create', async (req: Request, res: Response) => {
        const {name, description = ''} = req.body;
        const {icon = null, logo = null} = req.files || {};
        const id = await createOrganizer(name, description, icon as UploadedFile, logo as UploadedFile);
        return res.json(id).status(201);
    });
    
    route.patch('/:organizerId', async (req: Request, res: Response) => {
        const {name = null, description = null} = req.body;
        const {icon = null, logo = null} = req.files || {};
        await updateOrganizer(+req.params.organizerId, name, description, icon as UploadedFile, logo as UploadedFile);
        return res.send().status(204);
    });
    
    route.delete('/:organizerId', async (req: Request, res: Response) => {
        await deleteOrganizer(+req.params.organizerId);
        return res.send().status(204);
    });
};
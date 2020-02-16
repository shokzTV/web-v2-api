import { Router, Request, Response } from 'express';
import { getOrganizer, createOrganizer, updateOrganizer, deleteOrganizer, getAllOrganizer } from '../../services/organizer';
import { getIdsFromRequest } from './helper';
import { UploadedFile } from 'express-fileupload';
import { Organizer } from '../../entities/Organizer';
import { checkUserRole } from '../../middlewares/access';

const route = Router();

export default (app: Router) => {
    app.use('/organizer', route);

    route.get('/byId', async (req: Request, res: Response) => {
        const ids = getIdsFromRequest(req);
        let organizer: Organizer[] = [];
        if(ids.length > 0) {
            organizer = await getOrganizer(ids);
        }
        return res.json(organizer).status(200);
    });

    route.get('/list', checkUserRole('ADMIN_ACCESS'), async (req: Request, res: Response) => {
        const organizer = await getAllOrganizer();
        return res.json(organizer).status(200);
    });

    route.post('/create', checkUserRole('ORGANIZER_CREATE'), async (req: Request, res: Response) => {
        const {name, description = ''} = req.body;
        const {icon = null, logo = null} = req.files || {};
        const id = await createOrganizer(name, description, icon as UploadedFile, logo as UploadedFile);
        return res.json(id).status(201);
    });
    
    route.patch('/:organizerId', checkUserRole('ORGANIZER_EDIT'), async (req: Request, res: Response) => {
        const {name = null, description = null} = req.body;
        const {icon = null, logo = null} = req.files || {};
        await updateOrganizer(+req.params.organizerId, name, description, icon as UploadedFile, logo as UploadedFile);
        return res.send().status(204);
    });
    
    route.delete('/:organizerId', checkUserRole('ORGANIZER_DELETE'), async (req: Request, res: Response) => {
        await deleteOrganizer(+req.params.organizerId);
        return res.send().status(204);
    });
};
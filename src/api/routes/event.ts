import { Router, Request, Response } from 'express';
import { getMainEvent, getEvents, deleteEvent, changeMainEvent, toggleFeatureEvent, getEventIds, createEvent, upadteEvent } from '../../services/event';
import { getIdsFromRequest, getArrayFromBody } from './helper';
import { UploadedFile } from 'express-fileupload';
import { EventLinkType } from '../../entities/Event';
import { requireTags } from '../../services/tag';

const route = Router();

export default (app: Router) => {
    app.use('/event', route);

    route.get('/main', async (req: Request, res: Response) => {
        const mainEvent = await getMainEvent();
        return res.json(mainEvent).status(200);
    });

    route.get('/ids', async (req: Request, res: Response) => {
        const eventIds = await getEventIds();
        return res.json(eventIds).status(200);
    });
    
    route.get('/list', async (req: Request, res: Response) => {
        const ids = getIdsFromRequest(req);
        const events = await getEvents(ids);
        return res.json(events).status(200);
    });
    
    route.post('/create', async (req: Request, res: Response) => {
        const {
            name,
            organizer,
            descriptionShort = '', 
            start,
            end,
            country = '',
            location = '',
            pricePool = '',
            description = '',
            descriptionType = 'description',
            disclaimer = ''
        } = req.body;
        const tags = getArrayFromBody(req.body.tags);
        const links = getArrayFromBody<{type: EventLinkType, name: string, source: string}>(req.body.links);
        const {banner = null, organizationLogo = null} = req.files || {};
        const eventId = await createEvent(
            name,
            organizer,
            descriptionShort,
            start,
            end,
            country,
            location,
            pricePool,
            description,
            descriptionType,
            disclaimer,
            banner as UploadedFile,
            organizationLogo as UploadedFile,
            tags,
            links
        );
        return res.json(eventId).status(200);
    });

    route.patch('/:eventId', async (req: Request, res: Response) => {
        const {
            name,
            organizer,
            descriptionShort, 
            start,
            end,
            country,
            location,
            pricePool,
            description,
            descriptionType,
            disclaimer
        } = req.body;
        const {banner = null, organizationLogo = null} = req.files || {};
        await upadteEvent(
            +req.params.eventId,
            name,
            organizer,
            descriptionShort,
            start,
            end,
            country,
            location,
            pricePool,
            description,
            descriptionType,
            disclaimer,
            banner as UploadedFile | undefined,
            organizationLogo as UploadedFile | undefined,
        );
        return res.send().status(204);
    });
    
    route.put('/unfeature/:eventId', async (req: Request, res: Response) => {
        await toggleFeatureEvent(+req.params.eventId, false);
        return res.send().status(204);
    });
    
    route.put('/feature/:eventId', async (req: Request, res: Response) => {
        await toggleFeatureEvent(+req.params.eventId, true);
        return res.send().status(204);
    });

    route.put('/mainEvent/:eventId', async (req: Request, res: Response) => {
        await changeMainEvent(+req.params.eventId);
        return res.send().status(204);
    });
    
    route.delete('/:eventId', async (req: Request, res: Response) => {
        await deleteEvent(+req.params.eventId);
        return res.send().status(204);
    });
};
import { Router, Request, Response } from 'express';
import { getMainEvent, getEvents, deleteEvent, changeMainEvent, toggleFeatureEvent, getEventIds } from '../../services/event';
import { getIdsFromRequest } from './helper';

const route = Router();

export default (app: Router) => {
    app.use('/event', route);

    route.get('/mainEvent', async (req: Request, res: Response) => {
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
    
    route.delete(':eventId', async (req: Request, res: Response) => {
        await deleteEvent(+req.params.eventId);
        return res.send().status(204);
    });
};
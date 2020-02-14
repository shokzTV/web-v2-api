import { DecoratedEvent, Event, EventLink } from "../entities/Event";
import { RowDataPacket } from "mysql2";
import { getConn } from "../db";
import { Tag } from "./tag";
import { Organizer } from "../entities/Organizer";
import { removeFile } from "./File";

type EventRow = Event & RowDataPacket;
type EventLinkRow = EventLink & RowDataPacket;
type OrganizerRow  = Organizer & RowDataPacket;

type TagResponse = Tag  & RowDataPacket & {
    article: number;
}

export async function getEventIds(): Promise<number[]> {
    const conn = await getConn();
    const [eventRows] = await conn.execute<EventRow[]>(`SELECT id FROM event ORDER by end DESC`);
    await conn.end();
    return eventRows.map(({id}) => id);
}

export async function getMainEvent(): Promise<DecoratedEvent | undefined> {
    const conn = await getConn();
    const [eventRows] = await conn.execute<EventRow[]>(`SELECT id FROM event WHERE is_main_event = 1;`);
    const eventId = eventRows[0].id;
    await conn.end();
    const events = await getEvents([eventId]);

    return events.find(({id}) => id === eventId);
}

export async function getEvents(ids: number[]): Promise<DecoratedEvent[]> {
    const conn = await getConn();

    const cond = Array(ids.length).fill('?');
    const [events] = await conn.execute<EventRow[]>(`
      SELECT 
        id, 
        organizer_id as oranizer, 
        name, 
        description_short as descriptionShort, 
        UNIX_TIMESTAMP(start) as start, 
        UNIX_TIMESTAMP(end) as end,
        country,
        location,
        price_pool as pricePool,
        banner,
        description,
        description_type as descriptionType,
        disclaimer,
        is_featured as isFeatured,
        is_main_event as isMainEvent
      FROM event WHERE id IN (${cond.join(',')})`, ids);
    const [eventTags] = await conn.execute<TagResponse[]>(`SELECT et.event_id as event, t.id, t.name, t.image FROM event_tags et INNER JOIN tag t ON t.id = et.tag_id WHERE et.event_id IN ${cond.join(',')}`, ids);
    const [eventLinks] = await conn.execute<EventLinkRow[]>(`SELECT id, event_id as event, link_type as linkType, name, link FROM event_links WHERE event_id IN (${cond.join(',')})`, ids);
    const [organizers] = await conn.execute<OrganizerRow[]>('SELECT * from organizer');
    await conn.end();

    return events.map((event) => ({
        ...event,
        organizer: (organizers.find(({id}) => id === event.organizer) as Organizer),
        tags: eventTags.filter(({event: tagEvent}) => tagEvent === event.id),
        links: eventLinks.filter(({event: linkEvent}) => linkEvent === event.id),
    }));
}

export async function toggleFeatureEvent(eventId: number, feature: boolean): Promise<void> {
    const conn = await getConn();
    await conn.execute('UPDATE event SET is_featured = ? WHERE id = ?', [feature ? '1' : '0', eventId]);
    await conn.end();
}

export async function changeMainEvent(eventId: number): Promise<void> {
    const conn = await getConn();
    await conn.execute('UPDATE event SET is_main_event = 0');
    await conn.execute('UPDATE event SET is_main_event = 1 WHERE id = ?', [eventId]);
    await conn.end();
}

export async function deleteEvent(eventId: number): Promise<void> {
    const conn = await getConn();
    const [events] = await conn.execute<EventRow[]>(`SELECT banner FROM event WHERE id = ?`, [eventId]);
    const eventBanner = events[0].banner;
    eventBanner.length > 0 && removeFile(eventBanner);

    await conn.execute('DELETE FROM event_links WHERE event_id = ?', [eventId]);
    await conn.execute('DELETE FROM event_tags WHERE event_id = ?', [eventId]);
    await conn.execute('DELETE FROM event WHERE id = ?', [eventId]);

    await conn.end();
}
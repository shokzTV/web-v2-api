import { DecoratedEvent, Event, EventLink, EventDescriptionType, EventLinkType } from "../entities/Event";
import { RowDataPacket, OkPacket } from "mysql2";
import { getConn } from "../db";
import { Tag } from "./tag";
import { Organizer } from "../entities/Organizer";
import { removeFile, saveFormFile } from "./File";
import { UploadedFile } from "express-fileupload";
import { requireTags } from './tag';
import { getArticles } from "./article";
import { loadVideosById, Video } from "./video";

type EventRow = Event & RowDataPacket;
type EventLinkRow = EventLink & RowDataPacket;
type OrganizerRow  = Organizer & RowDataPacket;

type TagResponse = Tag  & RowDataPacket & {
    article: number;
}

export async function getEventIds(): Promise<number[]> {
    const conn = await getConn();
    const [eventRows] = await conn.execute<EventRow[]>(`SELECT id FROM event WHERE is_featured = 0 ORDER by end DESC`);
    await conn.end();
    return eventRows.map(({id}) => id);
}

export async function getMainEvent(): Promise<DecoratedEvent | undefined> {
    const conn = await getConn();
    const [eventRows] = await conn.execute<EventRow[]>(`SELECT id FROM event WHERE is_main_event = 1;`);
    if(eventRows[0]) {
        const eventId = eventRows[0].id;
        await conn.end();
        const events = await getEvents([eventId]);
    
        return events.find(({id}) => id === eventId);
    }

    return;
}

export async function getFeaturedEvents(): Promise<DecoratedEvent[]> {
    const conn = await getConn();
    const [eventRows] = await conn.execute<EventRow[]>(`SELECT id FROM event WHERE is_featured = 1;`);
    const eventIds = eventRows.map(({id}) => id);
    await conn.end();
    return eventIds.length === 0 ? [] : await getEvents(eventIds);
}

export async function getAllEvents(): Promise<DecoratedEvent[]> {
    const conn = await getConn();

    const [events] = await conn.execute<EventRow[]>(`
      SELECT 
        id, 
        organizer_id as organizer, 
        name, 
        description_short as descriptionShort, 
        UNIX_TIMESTAMP(start) as start, 
        UNIX_TIMESTAMP(end) as end,
        country,
        location,
        price_pool as pricePool,
        banner as banner,
        banner_webp as bannerWEBP,
        banner_jpeg_2000 as bannerJP2,
        description,
        description_type as descriptionType,
        disclaimer,
        CAST(is_featured AS UNSIGNED) as isFeatured,
        CAST(is_main_event AS UNSIGNED) as isMainEvent,
        organizer_logo as organizerLogo,
        organizer_logo_webp as organizerLogoWEBP,
        organizer_logo_jpeg_2000 as organizerLogoJP2;
      FROM event`);
    const [eventTags] = await conn.execute<TagResponse[]>(`SELECT et.event_id as event, t.id, t.name, t.imager as image, t.image_webp as imageWEBP, t.image_jpeg_2000 as imageJP2 FROM event_tags et INNER JOIN tag t ON t.id = et.tag_id`);
    const [eventLinks] = await conn.execute<EventLinkRow[]>(`SELECT id, event_id as event, link_type as linkType, name, link FROM event_links`);
    const [organizers] = await conn.execute<OrganizerRow[]>('SELECT * from organizer');
    await conn.end();

    return events.map((event) => ({
        ...event,
        organizer: (organizers.find(({id}) => id === event.organizer) as Organizer),
        tags: eventTags.filter(({event: tagEvent}) => tagEvent === event.id),
        links: eventLinks.filter(({event: linkEvent}) => linkEvent === event.id),
    }));
}

export async function getEvents(ids: number[]): Promise<DecoratedEvent[]> {
    const conn = await getConn();

    const cond = Array(ids.length).fill('?');
    const [events] = await conn.execute<EventRow[]>(`
      SELECT 
        id, 
        organizer_id as organizer, 
        name, 
        description_short as descriptionShort, 
        UNIX_TIMESTAMP(start) as start, 
        UNIX_TIMESTAMP(end) as end,
        country,
        location,
        price_pool as pricePool,
        banner as banner,
        banner_webp as bannerWEBP,
        banner_jpeg_2000 as bannerJP2,
        description,
        description_type as descriptionType,
        disclaimer,
        CAST(is_featured AS UNSIGNED) as isFeatured,
        CAST(is_main_event AS UNSIGNED) as isMainEvent,
        organizer_logo as organizerLogo,
        organizer_logo_webp as organizerLogoWEBP,
        organizer_logo_jpeg_2000 as organizerLogoJP2
      FROM event WHERE id IN (${cond.join(',')})`, ids);
    const [eventTags] = await conn.execute<TagResponse[]>(`SELECT et.event_id as event, t.id, t.name, t.image as image, t.image_webp as imageWEBP, t.image_jpeg_2000 as imageJP2 FROM event_tags et INNER JOIN tag t ON t.id = et.tag_id WHERE et.event_id IN (${cond.join(',')})`, ids);
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

export async function createEvent(
    name: string,
    organizer: number,
    descShort: string, 
    start:number, 
    end: number,
    country: string,
    location: string,
    price: string,
    description: string,
    descriptionType: EventDescriptionType,
    disclaimer: string,
    banner: null | UploadedFile,
    organizerLogo: null | UploadedFile,
    tags: string[],
    links: string[],
): Promise<number> {
    let ban: string = '', banWebp: string = '', banJP2: string = '', org: string = '', orgWebp: string = '', orgJP2: string = '';
    if(banner) {
        [banWebp, banJP2, ban] = await saveFormFile('banner', name, banner, {height: 200});
    }
    if(organizerLogo) {
        [orgWebp, orgJP2, org] = await saveFormFile('organizer/eventlogo', name, organizerLogo, {height: 175}, true);
    }

    const conn = await getConn();
    const [{insertId}] = await conn.execute<OkPacket>(`
        INSERT INTO event (id, organizer_id, name, description_short, start, end, country, location, price_pool, banner, banner_webp, banner_jpeg_2000, description, description_type, disclaimer, organizer_logo, organizer_logo_webp, organizer_logo_jpeg_2000, is_featured, is_main_event) VALUE 
        (NULL, ?, ?, ?, FROM_UNIXTIME(?), FROM_UNIXTIME(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, b'0', b'0');`, 
    [organizer, name, descShort, start, end, country, location, price, ban, banWebp, banJP2, description, descriptionType, disclaimer, org, orgWebp, orgJP2]);
    await assignTags(insertId, tags);
    await assignLinks(insertId, links);
    await conn.end();
    return insertId;
}

export async function upadteEvent(
    eventId: number,
    name?: string,
    organizer?: number,
    descShort?: string, 
    start?:number, 
    end?: number,
    country?: string,
    location?: string,
    price?: string,
    description?: string,
    descriptionType?: EventDescriptionType,
    disclaimer?: string,
    banner?: null | UploadedFile,
    organizerLogo?: null | UploadedFile,
    tags?: string[],
    links?: string[],
): Promise<void> {
    const conn = await getConn();
    const oldEvent = (await getEvents([eventId]))[0];
    if(banner) {
        const bannerPath = await saveFormFile('banner', name || oldEvent.name, banner, {height: 200});
        await conn.execute('UPDATE event SET banner = ? WHERE id = ?', [bannerPath, eventId]);
    }
    if(organizerLogo) {
        const organizerLogoPath = await saveFormFile('organizer/eventlogo', name || oldEvent.name, organizerLogo, {height: 175});
        await conn.execute('UPDATE event SET organizer_logo = ? WHERE id = ?', [organizerLogoPath, eventId]);
    }
    if(name) {
        await conn.execute('UPDATE event SET name = ? WHERE id = ?', [name, eventId]);
    }
    if(organizer) {
        await conn.execute('UPDATE event SET organizer_id = ? WHERE id = ?', [organizer, eventId]);
    }
    if(descShort) {
        await conn.execute('UPDATE event SET description_short = ? WHERE id = ?', [descShort, eventId]);
    }
    if(start) {
        await conn.execute('UPDATE event SET start = FROM_UNIXTIME(?) WHERE id = ?', [start, eventId]);
    }
    if(end) {
        await conn.execute('UPDATE event SET end = FROM_UNIXTIME(?) WHERE id = ?', [end, eventId]);
    }
    if(country) {
        await conn.execute('UPDATE event SET country = ? WHERE id = ?', [country, eventId]);
    }
    if(location) {
        await conn.execute('UPDATE event SET location = ? WHERE id = ?', [location, eventId]);
    }
    if(price) {
        await conn.execute('UPDATE event SET price_pool = ? WHERE id = ?', [price, eventId]);
    }
    if(description) {
        await conn.execute('UPDATE event SET description = ? WHERE id = ?', [description, eventId]);
    }
    if(descriptionType) {
        await conn.execute('UPDATE event SET description_type = ? WHERE id = ?', [descriptionType, eventId]);
    }
    if(disclaimer) {
        await conn.execute('UPDATE event SET disclaimer = ? WHERE id = ?', [disclaimer, eventId]);
    }
    if(tags) {
        await conn.execute('DELETE FROM event_tags WHERE event_id = ?', [eventId]);
        assignTags(eventId, tags);
    }
    if(links) {
        await conn.execute('DELETE FROM event_links WHERE event_id = ?', [eventId]);
        assignLinks(eventId, links);
    }
    await conn.end();
}

async function assignTags(eventId: number, tags: string[] = []): Promise<void> {
    const tagMap = await requireTags(tags);
    const conn = await getConn();
    
    if(tags.length) {
        for(const tag of tags) {
            await conn.execute('INSERT INTO event_tags (event_id, tag_id) VALUES (?, ?);', [eventId, tagMap[tag]]);
        }
    }
    await conn.end();
}

async function assignLinks(eventId: number, links: string[] = []): Promise<void> {
    const conn = await getConn();
    try {
        for(const eventLink of links) {
            const {linkType, name, link} = JSON.parse(eventLink);
            await conn.execute('INSERT INTO event_links (id, event_id, link_type, name, link) VALUES (NULL, ?, ?, ?, ?);', [eventId, linkType, name, link]);
        }
    } catch(err) {
        console.log(err);
    }
    await conn.end();
}

export async function toggleFeatureEvent(eventId: number, feature: boolean): Promise<void> {
    const conn = await getConn();
    await conn.execute('UPDATE event SET is_featured = ? WHERE id = ?', [feature ? 1 : 0, eventId]);
    await conn.end();
}

export async function changeMainEvent(eventId: number): Promise<void> {
    const conn = await getConn();
    await conn.execute(`UPDATE event SET is_main_event = 0`);
    await conn.execute(`UPDATE event SET is_main_event = 1 WHERE id = ?`, [eventId]);
    await conn.end();
}

export async function deleteEvent(eventId: number): Promise<void> {
    const conn = await getConn();
    const [events] = await conn.execute<EventRow[]>(`SELECT banner FROM event WHERE id = ?`, [eventId]);
    const eventBanner = events[0] ? events[0].banner : '';
    eventBanner.length > 0 && removeFile(eventBanner);

    await conn.execute('DELETE FROM event_links WHERE event_id = ?', [eventId]);
    await conn.execute('DELETE FROM event_tags WHERE event_id = ?', [eventId]);
    await conn.execute('DELETE FROM event WHERE id = ?', [eventId]);

    await conn.end();
}

interface RelationResponse {
    articles: Array<{
        id: number;
        title: string;
        cover: string;
        coverWEBP: string;
        coverJP2: string;
    }>;
    videos: Video[];
}

interface IdResponse extends RowDataPacket {
    id: number;
}

export async function getEventRelations(eventId: number): Promise<RelationResponse> {
    const conn = await getConn();
    const [tags] = await conn.execute<IdResponse[]>(`SELECT tag_id as id FROM event_tags WHERE event_id = ?`, [eventId]);
    const tagIds = tags.map(({id}) => id);
    const cond = Array(tagIds.length).fill('?');
    const [articleRows] = await conn.execute<IdResponse[]>(`SELECT article_id as id FROM article_tags WHERE tag_id IN (${cond.join(',')})`, tagIds);
    const [videoRows] = await conn.execute<IdResponse[]>(`SELECT video_id as id FROM video_tags WHERE tag_id IN (${cond.join(',')})`, tagIds);

    await conn.end();

    const articles = articleRows.length > 0 ? await getArticles(articleRows.map(({id}) => id)) : [];
    const videos = videoRows.length > 0 ?  await loadVideosById(videoRows.map(({id}) => id)) : [];

    return {
        videos,
        articles: articles.map((article) => ({
            id: article.id,
            title: article.title,
            cover: article.cover,
            coverWEBP: article.coverWEBP,
            coverJP2: article.coverJP2,
        }))
    };
}
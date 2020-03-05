import { Organizer } from '../entities/Organizer';
import { RowDataPacket, OkPacket } from 'mysql2';
import { getConn } from '../db';
import { UploadedFile } from 'express-fileupload';
import { saveFormFile, removeFile } from './File';

type OrganizerRow = Organizer & RowDataPacket;
type EventCountRow = {count: number, organizer: number} & RowDataPacket;

export async function getAllOrganizer(): Promise<Organizer[]> {
    const conn = await getConn();
    const [organizer] = await conn.execute<OrganizerRow[]>(`SELECT id, name, logo_webp as logo, logo_jpeg_2000 as logoJP2, icon_webp as icon, icon_jpeg_2000 as iconJP2 from organizer`);
    const [events] = await conn.execute<EventCountRow[]>(`SELECT COUNT(id) as count, organizer_id as organizer from event GROUP BY organizer_id`);
    await conn.end();
    return organizer.map((org) => ({
        ...org,
        events: (events.find(({organizer}) => organizer === org.id) || {count: 0}).count
    }));
}

export async function getOrganizer(ids: number[]): Promise<Organizer[]> {
    const conn = await getConn();
    const cond = Array(ids.length).fill('?');
    const [organizer] = await conn.execute<OrganizerRow[]>(`SELECT id, name, logo_webp as logo, logo_jpeg_2000 as logoJP2, icon_webp as icon, icon_jpeg_2000 as iconJP2 from organizer WHERE id IN (${cond.join(',')})`, ids);
    const [events] = await conn.execute<EventCountRow[]>(`SELECT COUNT(id) as count, organizer_id as organizer from event GROUP BY organizer_id`);
    await conn.end();
    return organizer.map((org) => ({
        ...org,
        events: (events.find(({organizer}) => organizer === org.id) || {count: 0}).count
    }));
}

export async function createOrganizer(name: string, description: string, icon: UploadedFile | null, logo: UploadedFile | null): Promise<number> {
    const conn = await getConn();
    
    let iWebp: string= '', iJP2: string = '', logoWebp: string= '', logoJP2: string = '';
    if(icon) {
        [iWebp, iJP2] = await saveFormFile('organizer/icon', name, icon, {height: 45});
    }

    if(logo) {
        [logoWebp, logoJP2] = await saveFormFile('organizer/logo', name, logo, {height: 175});
    }

    const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO organizer (id, name, description, icon_webp, icon_jpeg_2000, logo_webp, logo_jpeg_2000) VALUE (NULL, ?, ?, ?, ?, ?, ?);', [name, description, iWebp, iJP2, logoWebp, logoJP2]);
    await conn.end();
    return insertId;
}

export async function updateOrganizer(organizerId: number, name?: string, description?: string, icon?: UploadedFile | null, logo?: UploadedFile | null): Promise<void> {
    const conn = await getConn();
    const [oldRows] = (await conn.execute<OrganizerRow[]>(`SELECT name from organizer WHERE id = ?`, [organizerId]));
    const oldName = oldRows[0].name;

    if(name && name.length) {
        await conn.execute('UPDATE organizer SET name = ? WHERE id = ?;', [name, organizerId]);
    }
    if(description && description.length) {
        await conn.execute('UPDATE organizer SET name = ? WHERE id = ?;', [name, organizerId]);
    }
    if(icon) {
        const [webp, jp2] = await saveFormFile('organizer/icon', oldName, icon, {height: 45});
        await conn.execute('UPDATE organizer SET icon_webp = ?, icon_jpeg_2000 WHERE id = ?;', [webp, jp2, organizerId]);
    }
    if(logo) {
        const [webp, jp2] = await saveFormFile('organizer/logo', oldName, logo, {height: 175});
        await conn.execute('UPDATE organizer SET logo_webp = ?, logo_jpeg_2000 = ? WHERE id = ?;', [webp, jp2, organizerId]);
    }
    await conn.end();
}

export async function deleteOrganizer(organizerId: number): Promise<void> {
    const conn = await getConn();
    const [oldRows] = (await conn.execute<OrganizerRow[]>(`SELECT icon_webp, icon_jpeg_2000, logo_webp, logo_jpeg_2000 from organizer WHERE id = ?`, [organizerId]));
    const oldRow = oldRows[0];

    oldRow.icon_webp.length > 0 && removeFile(oldRow.icon_webp);
    oldRow.icon_jpeg_2000.length > 0 && removeFile(oldRow.icon_jpeg_2000);
    oldRow.logo_webp.length > 0 && removeFile(oldRow.logo_webp);
    oldRow.logo_jpeg_2000.length > 0 && removeFile(oldRow.logo_jpeg_2000);
    
    await conn.execute('DELETE FROM organizer WHERE id = ?', [organizerId]);
    await conn.end();
}
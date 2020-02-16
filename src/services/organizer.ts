import { Organizer } from '../entities/Organizer';
import { RowDataPacket, OkPacket } from 'mysql2';
import { getConn } from '../db';
import { UploadedFile } from 'express-fileupload';
import { saveFormFile, removeFile } from './File';

type OrganizerRow = Organizer & RowDataPacket;
type EventCountRow = {count: number, organizer: number} & RowDataPacket;

export async function getAllOrganizer(): Promise<Organizer[]> {
    const conn = await getConn();
    const [organizer] = await conn.execute<OrganizerRow[]>(`SELECT id, name, logo, logo_small as icon from organizer`);
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
    const [organizer] = await conn.execute<OrganizerRow[]>(`SELECT id, name, logo, logo_small as icon from organizer WHERE id IN (${cond.join(',')})`, ids);
    const [events] = await conn.execute<EventCountRow[]>(`SELECT COUNT(id) as count, organizer_id as organizer from event GROUP BY organizer_id`);
    await conn.end();
    return organizer.map((org) => ({
        ...org,
        events: (events.find(({organizer}) => organizer === org.id) || {count: 0}).count
    }));
}

export async function createOrganizer(name: string, description: string, icon: UploadedFile | null, logo: UploadedFile | null): Promise<number> {
    const conn = await getConn();
    
    let iconPath: string= '', logoPath: string = '';
    if(icon) {
        iconPath = await saveFormFile('organizer/icon', name, icon, {height: 45});
    }

    if(logo) {
        logoPath = await saveFormFile('organizer/logo', name, logo, {height: 175});
    }

    const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO organizer (id, name, description, logo_small, logo) VALUE (NULL, ?, ?, ?, ?);', [name, description, iconPath, logoPath]);
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
        const path = await saveFormFile('organizer/icon', oldName, icon, {height: 45});
        await conn.execute('UPDATE organizer SET logo_small = ? WHERE id = ?;', [path, organizerId]);
    }
    if(logo) {
        const path = await saveFormFile('organizer/logo', oldName, logo, {height: 175});
        await conn.execute('UPDATE organizer SET logo = ? WHERE id = ?;', [path, organizerId]);
    }
    await conn.end();
}

export async function deleteOrganizer(organizerId: number): Promise<void> {
    const conn = await getConn();
    const [oldRows] = (await conn.execute<OrganizerRow[]>(`SELECT logo_small, logo from organizer WHERE id = ?`, [organizerId]));
    const oldRow = oldRows[0];

    oldRow.logo_small.length > 0 && removeFile(oldRow.logo_small);
    oldRow.logo.length > 0 && removeFile(oldRow.logo);
    
    await conn.execute('DELETE FROM organizer WHERE id = ?', [organizerId]);
    await conn.end();
}
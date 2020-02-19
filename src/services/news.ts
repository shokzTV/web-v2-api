import { getConn } from "../db";
import { RowDataPacket, OkPacket } from "mysql2";

export interface News extends RowDataPacket {
    id: number;
    headline: string;
    description: string;
    source: string;
    created: number;
}

export async function getNews(): Promise<News[]> {
    const conn = await getConn();
    const [news] = await conn.execute<News[]>('SELECT id, headline, description, source, created FROM news');
    await conn.end();
    return news;
}

export async function createNews(name: string, description: string = '', source: string, userId: number): Promise<number> {
    const conn = await getConn();
    const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO news (id, user_id, headline, description, source, created) VALUE (NULL, ?, ?, ?, ?, NOW());', [userId, name, description, source]);
    await conn.end();
    return insertId;
}

export async function editNews(id: number, name?: string, description?: string, source?: string): Promise<void> {
    const conn = await getConn();

    if(name) {
        await conn.execute('UPDATE news SET headline=? WHERE id=?', [name, id]);
    }

    if(description) {
        await conn.execute('UPDATE news SET description=? WHERE id=?', [description, id]);
    }

    if(source) {
        await conn.execute('UPDATE news SET source=? WHERE id=?', [source, id]);
    }

    await conn.end();
}

export async function deleteNews(id: number): Promise<void> {
    const conn = await getConn();
    await conn.execute('DELETE FROM news WHERE id = ?', [id]);
    await conn.end();
}
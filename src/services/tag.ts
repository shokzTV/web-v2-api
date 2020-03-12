import { getConn } from "../db";
import { RowDataPacket, OkPacket } from "mysql2";
import { UploadedFile } from "express-fileupload";
import { saveFormFile } from "./File";
import { getArticles } from "./article";
import { loadVideosById, Video } from "./video";
import { getEvents } from "./event";
import { DecoratedEvent } from "../entities/Event";

type TagIdMap = {[x: string]: number};

export interface Tag extends RowDataPacket {
    id: number;
    name: string;
    image?: string;
}

export async function requireTags(tags: string[] = []): Promise<TagIdMap> {
    if(tags.length) {
        const conn = await getConn();
        const cond = Array(tags.length).fill('?');
        const [knownTagRows] = await conn.execute<Tag[]>(`SELECT id, name FROM tag WHERE name IN (${cond.join(',')})`, tags);
        const mappedTags = knownTagRows.reduce<TagIdMap>((acc, {id, name}) => ({...acc, [name]: id}), {});
        const knownNames = Object.keys(mappedTags);
        const unknownTags = tags.filter((tag) => !knownNames.includes(tag));
    
        for(const unknwonTag of unknownTags) {
            const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO tag (id, name, description, image, image_webp, image_jpeg_2000) VALUES (NULL, ?, "", "", "", "")', [unknwonTag]);
            mappedTags[unknwonTag] = insertId;
        }
    
        await conn.end();
        return mappedTags;
    }
    
    return {};
}

async function saveTagCover(name: string, file: UploadedFile): Promise<[string, string, string]> {
    return await saveFormFile('tags', name, file);
}

export async function getTags(): Promise<Tag[]> {
    const conn = await getConn();
    const [tags] = await conn.execute<Tag[]>(`
        SELECT t.id, t.name, t.description, t.image as image, t.image_webp as imageWEBP, t.image_jpeg_2000 as imageJP2 , UNIX_TIMESTAMP(a.created) as lastAction
          FROM tag t
     LEFT JOIN article_tags at ON at.tag_id = t.id 
     LEFT JOIN article a ON a.id = at.article_id 
      GROUP BY t.id 
      ORDER BY a.created DESC`
    );
    await conn.end();
    return tags;
}

export async function getTag(tagId: number): Promise<Tag> {
    const conn = await getConn();
    const [tags] = await conn.execute<Tag[]>(
        `SELECT id, name, description, image as image, image_webp as imageWEBP, image_jpeg_2000 as imageJP2 FROM tag WHERE id ?`,
        [tagId]
    );
    await conn.end();
    return tags[0];
}

interface IdResponse extends RowDataPacket {
    id: number;
}

interface Params {
    event: DecoratedEvent[];
    articles: Array<{
        id: number;
        title: string;
        cover: string;
        coverWEBP: string;
        coverJP2: string;
    }>;
    videos: Video[];
}

export async function getTagRelations(tagId: number): Promise<Params> {
    const conn = await getConn();
    const [eventRows] = await conn.execute<IdResponse[]>(`SELECT event_id as id FROM event_tags WHERE tag_id = ?)`, [tagId]);
    const [articleRows] = await conn.execute<IdResponse[]>(`SELECT article_id as id FROM article_tags WHERE tag_id = ?)`, [tagId]);
    const [videoRows] = await conn.execute<IdResponse[]>(`SELECT video_id as id FROM video_tags WHERE tag_id = ?`, [tagId]);
    await conn.end();

    const event = eventRows.length > 0 ? await getEvents(eventRows.map(({id}) => id)) : [];
    const articles = articleRows.length > 0 ? await getArticles(articleRows.map(({id}) => id)) : [];
    const videos = videoRows.length > 0 ?  await loadVideosById(videoRows.map(({id}) => id)) : [];

    return {
        event,
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

export async function getRecentTags(): Promise<Tag[]> {
    const conn = await getConn();
    const [tags] = await conn.execute<[]>(`
        SELECT t.id, t.name, t.description, t.image as image, t.image_webp as imageWEBP, t.image_jpeg_2000 as imageJP2, a.created as date
          FROM tag t
     LEFT JOIN article_tags at ON at.tag_id = t.id
     LEFT JOIN article a ON a.id = at.article_id
      GROUP BY t.id 
      ORDER BY date DESC  
       LIMIT 8
    `);
    await conn.end();
    return tags;
}

export async function createTag(name: string, description: string = '', image?: UploadedFile): Promise<number> {
    const conn = await getConn();
    
    let webp: string|null= '', jpeg2000: string|null= '', orig: string|null = '';
    if(image) {
        [webp, jpeg2000, orig] = await saveTagCover(name, image);
    }
    const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO tag (id, name, description, image, image_webp, image_jpeg_2000) VALUE (NULL, ?, ?, ?, ?, ?);', [name, description, orig, webp, jpeg2000]);
    await conn.end();

    return insertId;
}

export async function patchTag(id: number, name?: string, description?: string, image?: UploadedFile): Promise<void> {
    const conn = await getConn();

    if(name) {
        await conn.execute('UPDATE tag SET name=? WHERE id=?', [name, id]);
    }
    if(description) {
        await conn.execute('UPDATE tag SET description=? WHERE id=?', [description, id]);
    }

    if(image) {
        const [webp, jpeg2000, orig] = await saveTagCover(''+id, image);
        await conn.execute('UPDATE tag SET image=?, image_webp=?, image_jpeg_2000=? WHERE id=?', [orig, webp, jpeg2000, id]);
    }

    await conn.end();
}

export async function delTag(id: number): Promise<void> {
    const conn = await getConn();

    await conn.execute('DELETE FROM article_tags WHERE tag_id = ?', [id]);
    await conn.execute('DELETE FROM tag WHERE id = ?', [id]);

    await conn.end();
}
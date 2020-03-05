import { getConn } from "../db";
import { RowDataPacket, OkPacket } from "mysql2";
import { UploadedFile } from "express-fileupload";
import { saveFormFile } from "./File";

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
            const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO tag (id, name, description, image) VALUES (NULL, ?, "", "")', [unknwonTag]);
            mappedTags[unknwonTag] = insertId;
        }
    
        await conn.end();
        return mappedTags;
    }
    
    return {};
}

async function saveTagCover(name: string, file: UploadedFile): Promise<[string, string]> {
    return await saveFormFile('tags', name, file);
}

export async function getTags(): Promise<Tag[]> {
    const conn = await getConn();
    const [tags] = await conn.execute<Tag[]>(`
        SELECT t.id, t.name, t.description, t.image_webp as image, t.image_jpeg_2000 as imageJP2 , UNIX_TIMESTAMP(a.created) as lastAction
          FROM tag t
     LEFT JOIN article_tags at ON at.tag_id = t.id 
     LEFT JOIN article a ON a.id = at.article_id 
      GROUP BY t.id 
      ORDER BY a.created DESC`
    );
    await conn.end();
    return tags;
}

export async function createTag(name: string, description: string = '', image?: UploadedFile): Promise<number> {
    const conn = await getConn();
    
    let webp: string|null= '', jpeg2000: string|null= '';
    if(image) {
        [webp, jpeg2000] = await saveTagCover(name, image);
    }
    const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO tag (id, name, description, image_webp, image_jpeg_2000) VALUE (NULL, ?, ?, ?);', [name, description, webp, jpeg2000]);
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
        const [webp, jpeg2000] = await saveTagCover(''+id, image);
        await conn.execute('UPDATE tag SET image_webp=?, image_jpeg_2000=? WHERE id=?', [webp, jpeg2000, id]);
    }

    await conn.end();
}

export async function delTag(id: number): Promise<void> {
    const conn = await getConn();

    await conn.execute('DELETE FROM article_tags WHERE tag_id = ?', [id]);
    await conn.execute('DELETE FROM tag WHERE id = ?', [id]);

    await conn.end();
}
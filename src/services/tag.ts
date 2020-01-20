import { getConn } from "../db";
import { RowDataPacket, OkPacket } from "mysql2";
import { UploadedFile } from "express-fileupload";
import uuid from 'uuid/v5';
import sharp from 'sharp';

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
            const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO tag (id, name, image) VALUES (NULL, ?, "")', [unknwonTag]);
            mappedTags[unknwonTag] = insertId;
        }
    
        await conn.end();
        return mappedTags;
    }
    
    return {};
}

async function saveTagCover(name: string, file: UploadedFile): Promise<string> {
    let imagePath: string|null= null;
    const imgHash = uuid(name, uuid.URL);
    imagePath = `/static/tags/${imgHash}.jpeg`;
    const orgImagePath = `/static/tags/${imgHash}_orig.jpeg`;
    await sharp(file.data)
            .jpeg()
            .resize({ width: 512, height: 288 })
            .toFile(__dirname + `/../..${imagePath}`);
    await sharp(file.data)
            .jpeg()
            .toFile(__dirname + `/../..${orgImagePath}`);

    return imagePath;
}

export async function getTags(): Promise<Tag[]> {
    const conn = await getConn();
    const [tags] = await conn.execute<Tag[]>('SELECT id, name, image FROM tag');
    await conn.end();
    return tags;
}

export async function createTag(name: string, image?: UploadedFile): Promise<number> {
    const conn = await getConn();
    
    let imagePath: string|null= '';
    if(image) {
        imagePath = await saveTagCover(name, image);
    }
    const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO tag (id, name, image) VALUE (NULL, ?, ?);', [name, imagePath]);
    await conn.end();

    return insertId;
}

export async function patchTag(id: number, name?: string, image?: UploadedFile): Promise<void> {
    const conn = await getConn();

    if(name) {
        await conn.execute('UPDATE tag SET name=? WHERE id=?', [name, id]);
    }

    if(image) {
        const imagePath = await saveTagCover(''+id, image);
        await conn.execute('UPDATE tag SET image=? WHERE id=?', [imagePath, id]);
    }

    await conn.end();
}

export async function delTag(id: number): Promise<void> {
    const conn = await getConn();

    await conn.execute('DELETE FROM article_tags WHERE tag_id = ?', [id]);
    await conn.execute('DELETE FROM tag WHERE id = ?', [id]);

    await conn.end();
}
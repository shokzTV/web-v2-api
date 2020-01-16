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

export async function requireTags(tags: string[]): Promise<TagIdMap> {
    const conn = await getConn();
    const [knownTagRows] = await conn.execute<Tag[]>('SELECT id, name FROM tag WHERE name IN (?)', [tags.join(', ')]);

    const mappedTags = knownTagRows.reduce<TagIdMap>((acc, {id, name}) => ({...acc, [name]: id}), {});
    const knownNames = Object.keys(tags);
    const unknownTags = tags.filter((tag) => !knownNames.includes(tag));

    for(const unknwonTag of unknownTags) {
        const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO tag (id, name, image) VALUES (NULL, ?, "")', [unknwonTag]);
        mappedTags[unknwonTag] = insertId;
    }

    await conn.end();
    return mappedTags;
}

async function saveTagCover(name: string, file: UploadedFile): Promise<string> {
    let imagePath: string|null= null;
    const imgHash = uuid(name, uuid.URL);
    imagePath = `/static/tags/${imgHash}.webp`;
    const orgImagePath = `/static/tags/${imgHash}_orig.webp`;
    await sharp(file.data)
    .webp({ lossless: true })
            .resize({ width: 512, height: 288 })
            .toFile(__dirname + `/../..${imagePath}`);
    await sharp(file.data)
            .webp({ lossless: true })
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
    
    let imagePath: string|null= null;
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
        const imagePath = saveTagCover(''+id, image);
        await conn.execute('UPDATE tag SET image=? WHERE id=?', [imagePath, id]);
    }

    await conn.end();
}
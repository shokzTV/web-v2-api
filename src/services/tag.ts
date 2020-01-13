import { getConn } from "../db";
import { RowDataPacket, OkPacket } from "mysql2";
import { UploadedFile } from "express-fileupload";
import uuid from 'uuid/v5';

interface Tag extends RowDataPacket {
    id: number;
    name: string;
    image: string;   
}

function saveTagCover(name: string, file: UploadedFile): string {
    let imagePath: string|null= null;
    const imgHash = uuid(name, uuid.URL);
    imagePath = `/static/tags/${imgHash}.jpg`;
    const fullPath = __dirname + `/../..${imagePath}`;
    file.mv(fullPath);

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
        imagePath = saveTagCover(name, image);
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
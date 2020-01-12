import { getConn } from '../db';
import { RowDataPacket, OkPacket } from "mysql2/promise";


type TagIdMap = {[x: string]: number};

export interface Tag extends RowDataPacket {
    id: number;
    name: string;
    image?: string;
}

export async function requireTags(tags: string[]): Promise<TagIdMap> {
    const conn = await getConn();
    const [knownTagRows] = await conn.execute<Tag[]>('SELECT id, name FROM tags WHERE name IN (:tags)', [tags]);

    const mappedTags = knownTagRows.reduce<TagIdMap>((acc, {id, name}) => ({...acc, [name]: id}), {});
    const knownNames = Object.keys(tags);
    const unknownTags = tags.filter((tag) => !knownNames.includes(tag));

    for(const unknwonTag in unknownTags) {
        const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO tag (id, name, image) VALUES (NULL, ?, "")', [unknwonTag]);
        mappedTags[unknwonTag] = insertId;
    }

    conn.end();
    return mappedTags;
}
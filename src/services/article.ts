import { UploadedFile } from 'express-fileupload';
import { getConn } from '../db';
import uuid from 'uuid/v5';
import { OkPacket, RowDataPacket } from 'mysql2';
import {requireTags, Tag} from './tags';

enum Status {
    draft = 'draft',
    published = 'published',
    hidden = 'hidden',
}

interface Article extends RowDataPacket {
    id: number;
    title: string;
    body: string;
    tags: Array<{
        id: number;
        name: string;
        image?: string;
    }>;
    cover: string;
    status: Status;
    author: number;
    created: number;
}

interface TagResponse extends Tag {
    article: number;
}

export async function getArticles(articleIds: number[] = []): Promise<Article[]> {
    const conn = await getConn();
    let condition = '';
    const params = [];

    if( articleIds.length) {
        condition = 'WHERE id IN (:ids)';
        params.push(articleIds);
    }

    const [articles] = await conn.execute<Article[]>(`SELECT id, title, author, body, cover, status, FROM_UNIXTIME(created) as created FROM article ${condition}`, params);
    const [tags] = await conn.execute<TagResponse[]>(`SELECT at.article_id as article, t.id, t.name. t.image FROM article_tags at INNER JOIN tag t ON t.id = at.tag_id ${condition}`, params);

    await conn.end();

    return articles.map((a) => ({
        ...a,
        tags: tags.filter(({article}) => article === a.id).map(({id, name, image}) => ({id, name, image})),
    }));
}

export async function createDraft(title: string, body: string, tags: string[], userId: number, cover: UploadedFile |  null): Promise<number> {
    const conn = await getConn();
    
    let imagePath: string|null= null;
    if(cover) {
        const imgHash = uuid(title, uuid.URL);
        imagePath = `/static/covers/${imgHash}.jpg`;
        const fullPath = __dirname + `/../..${imagePath}`;
        cover.mv(fullPath);
    }

    const [{insertId}] = await conn.execute<OkPacket>(
        `INSERT INTO articles (id,title,author,created,cover,body,status) VALUES (NULL,?,?,NOW(),?,?,?)`,
        [title, userId, imagePath, body, Status.draft]
    );

    await assignTags(insertId, tags);
    await conn.end();

    return insertId;
}

export async function publishArticle(articleId: number): Promise<void> {
    const conn = await getConn();
    await conn.execute('UPDATE article SET status="published";', [articleId]);
    await conn.end();
}

export async function unpublishArticle(articleId: number): Promise<void> {
    const conn = await getConn();
    await conn.execute('UPDATE article SET status="hidden";', [articleId]);
    await conn.end();
}

async function assignTags(articleId: number, tags: string[]): Promise<void> {
    const tagMap = await requireTags(tags);
    const conn = await getConn();
    
    for(const tag of tags) {
        await conn.execute('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?);', [articleId, tagMap[tag]]);
    }
    await conn.end();
}

export async function assignTag(articleId: number, tag: string): Promise<void> {
    const tagIds = await requireTags([tag]);
    const tagId = tagIds[tag];
    const conn = await getConn();

    await conn.execute('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?);', [articleId, tagId]);
    await conn.end();
}

export async function removeTag(articleId: number, tagId: number): Promise<void> {
    const conn = await getConn();
    await conn.execute('DELETE FROM article_tags WHERE article_id = ? AND tag_id = ?;', [articleId, tagId]);
    await conn.end();
}

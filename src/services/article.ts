import { UploadedFile } from 'express-fileupload';
import { getConn } from '../db';
import uuid from 'uuid/v5';
import { OkPacket, RowDataPacket } from 'mysql2';
import {requireTags, Tag} from './tag';
import sharp from 'sharp';

enum Status {
    draft = 'draft',
    published = 'published',
    hidden = 'hidden',
}

interface Article {
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
    author: {
        id: number,
        twitch: number,
        avatar: string;
        name: string;
        title: string;
    };
    created: number;
}

interface ArticleRow extends RowDataPacket {
    articleId: number;
    title: string;
    body: string;
    cover: string;
    status: Status;
    created: number;
    userId: number;
    twitch_id: number;
    display_name: string;
    avatar: string;
    custom_title: string;
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

    const [articles] = await conn.execute<ArticleRow[]>(`SELECT a.id as articleId, a.title, a.body, a.cover, a.status, FROM_UNIXTIME(a.created) as created, u.id as userId, u.twitch_id, u.display_name, u.avatar, u.custom_title FROM article a INNER JOIN user u ON u.id = a.author ${condition}`, params);
    const [tags] = await conn.execute<TagResponse[]>(`SELECT at.article_id as article, t.id, t.name, t.image FROM article_tags at INNER JOIN tag t ON t.id = at.tag_id ${condition}`, params);

    await conn.end();

    return articles.map((a) => ({
        id: a.articleId,
        title: a.title,
        body: a.body,
        cover: a.cover,
        status: a.status,
        created: a.created,
        author: {
            id: a.userId,
            twitch: a.twitch_id,
            name: a.display_name,
            avatar: a.avatar,
            title: a.custom_title
        },
        tags: tags.filter(({article}) => article === a.id).map(({id, name, image}) => ({id, name, image})),
    }));
}

export async function createDraft(title: string, body: string, tags: string[], userId: number, cover: UploadedFile |  null): Promise<number> {
    const conn = await getConn();
    
    let imagePath: string= '';
    if(cover) {
        const imgHash = uuid(title, uuid.URL);
        imagePath = `/static/covers/${imgHash}.webp`;
        const orgImagePath = `/static/covers/${imgHash}_orig.webp`;
        await sharp(cover.data)
            .resize({ width: 512, height: 288 })
            .webp({ lossless: true })
            .toFile(__dirname + `/../..${imagePath}`);
        await sharp(cover.data)
            .webp({ lossless: true })
            .toFile(__dirname + `/../..${orgImagePath}`);
    }

    const [{insertId}] = await conn.execute<OkPacket>(
        `INSERT INTO article (id,title,author,created,cover,body,status) VALUES (NULL,?,?,NOW(),?,?,?)`,
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

import { fetchVideoByUrl } from "./twitchapi";
import { getConn } from "../db";
import { OkPacket, RowDataPacket } from "mysql2";
import { requireTags, Tag } from "./tag";
import {streamFile} from './File';

async function donwloadThumbnail(url: string): Promise<[string, string]> {
    const videoData = await fetchVideoByUrl(url);
    return await streamFile('videoThumbs', videoData.preview.large, videoData._id);
}

interface VideoRow extends RowDataPacket {
    videoId: number;
    title: string;
    source: string;
    thumbnail: string;
}

interface TagResponse extends Tag {
    video: number;
}

interface Video {
    id: number;
    title: string;
    source: string;
    thumbnail: string;
    tags: Array<{
        id: number;
        name: string;
        image?: string;
    }>;
}

interface IdsRowPacket extends RowDataPacket {
    id: number;
}

export async function getVideoIds(): Promise<number[]> {
    const conn = await getConn();
    const [videoIds] = await conn.execute<IdsRowPacket[]>('SELECT id FROM video ORDER BY id DESC;');
    await conn.end();
    return videoIds.map(({id}) => id);
}

export async function loadVideosById(ids: number[]): Promise<Video[]> {
    const conn = await getConn();
    const cond = Array(ids.length).fill('?');
    const [videos] = await conn.execute<VideoRow[]>(`SELECT v.id as videoId, v.title, v.source, v.thumbnail as thumbnail, v.thumbnail_webp as thumbnailWEBP, v.thumbnail_jpeg_2000 as thumbnailJP2 FROM video v WHERE id IN (${cond.join(',')});`, ids);
    const [tags] = await conn.execute<TagResponse[]>(`SELECT vt.video_id as video, t.id, t.name, t.image as image, t.image_webp as imageWEBP, t.image_jpeg_2000 as imageJP2 FROM video_tags vt INNER JOIN tag t ON t.id = vt.tag_id`);
    await conn.end();

    return mapRows(videos, tags);
}

export async function listVideos(): Promise<Video[]> {
    const conn = await getConn();
    const [videos] = await conn.execute<VideoRow[]>(`SELECT v.id as videoId, v.title, v.source, v.thumbnail as thumbnail, v.thumbnail_webp as thumbnailWEBP, v.thumbnail_jpeg_2000 as thumbnailJP2 FROM video v;`);
    const [tags] = await conn.execute<TagResponse[]>(`SELECT vt.video_id as video, t.id, t.name, t.image as image, t.image_webp as imageWEBP, t.image_jpeg_2000 as imageJP2 FROM video_tags vt INNER JOIN tag t ON t.id = vt.tag_id`);
    await conn.end();

    return mapRows(videos, tags);
}

function mapRows(rows: VideoRow[], tags: TagResponse[]): Video[] {
    return rows.map((v) => ({
        id: v.videoId,
        title: v.title,
        source: v.source,
        thumbnail: v.thumbnail,
        thumbnailJP2: v.thumbnailJP2,
        tags: tags.filter(({video}) => video === v.videoId).map(({id, name, image, imageJP2}) => ({id, name, image, imageJP2})),
    }));
} 

export async function createVideo(title: string, source: string, tags: string[]): Promise<number> {
    const conn = await getConn();
    const [webp, jp2] = await donwloadThumbnail(source);


    const [{insertId}] = await conn.execute<OkPacket>(
        `INSERT INTO video (id,title,source,thumbnail_webp, thumbnail_jpeg_2000,description) VALUES (NULL,?,?,?,?,?)`,
        [title, source, webp, jp2, '']
    );

    await assignTags(insertId, tags);
    await conn.end();

    return insertId;
}

export async function patchVideo(videoId: number, title: string, tags: string[]): Promise<void> {
    const conn = await getConn();
    await conn.execute('UPDATE video SET title=? WHERE id=?', [title, videoId]);
    if(tags.length > 0 ) {
        await conn.execute('DELETE FROM video_tags WHERE video_id = ?', [videoId]);
        await assignTags(videoId, tags);
    }
    await conn.end();
}

export async function deleteVideo(videoId: number): Promise<void> {
    const conn = await getConn();
    await conn.execute('DELETE FROM video_tags WHERE video_id = ?', [videoId]);
    await conn.execute('DELETE FROM video WHERE id = ?', [videoId]);
    await conn.end();
}

async function assignTags(videoId: number, tags: string[] = []): Promise<void> {
    const tagMap = await requireTags(tags);
    const conn = await getConn();
    
    if(tags.length) {
        for(const tag of tags) {
            await conn.execute('INSERT INTO video_tags (video_id, tag_id) VALUES (?, ?);', [videoId, tagMap[tag]]);
        }
    }
    await conn.end();
}
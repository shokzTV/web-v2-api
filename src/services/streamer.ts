import { RowDataPacket } from "mysql2";
import { getConn } from "../db";
import { removeFile, streamFile } from "./File";
import { fetchUser } from "./twitchapi";

export interface Streamer extends RowDataPacket {
    id: number;
    name: string;
    title: string;
    viewer: number;
    preview: string;
    previewWEBP: string;
    previewJP2: string;
    order: number;
}

export async function getAllStreamer(): Promise<Streamer[]> {
    const conn = await getConn();
    const [dataRows] = await conn.execute<Streamer[]>('SELECT id, name, title, viewer, preview, preview_webp as previewWEBP, preview_jpeg_2000 as previewJP2, sort_order, online FROM streamer;');
    await conn.end();

    return dataRows;
}

export async function getOnlineStreamer(): Promise<Streamer[]> {
    const conn = await getConn();
    const [dataRows] = await conn.execute<Streamer[]>('SELECT id, name, title, viewer, preview, preview_webp as previewWEBP, preview_jpeg_2000 as previewJP2, sort_order FROM streamer WHERE online = TRUE;');
    await conn.end();

    return dataRows;
}

export async function createStreamer(name: string): Promise<void> {
    const conn = await getConn();
    const userResponse = await fetchUser(name);
    const twitchId = userResponse.users[0]._id;
    await conn.execute("INSERT INTO streamer (id, name, twitch_id, title, viewer, preview, preview_webp, preview_jpeg_2000, sort_order) VALUES (NULL, ?, ?, '', 0, '', '', '', 0)", [name, twitchId]);
    await conn.end();
}

export async function updateStreamerStatus(twitchId: string, online: Boolean, title: string, viewer: number, previewUrl: string): Promise<void> {
    const conn = await getConn();
    let orig = '', webp = '', jp2 = '';
    const [rows] = await conn.execute<Streamer[]>('SELECT preview, preview_webp as previewWEBP, preview_jpeg_2000 as previewJP2 FROM streamer WHERE twitch_id = ?;', [twitchId]);
    const streamer = rows[0];
    streamer.preview.length > 0 && removeFile(streamer.preview);
    streamer.previewWEBP.length > 0 && removeFile(streamer.previewWEBP);
    streamer.previewJP2.length > 0 && removeFile(streamer.previewJP2);
    if(online) {
        [webp, jp2, orig] = await streamFile('streamerPreview', previewUrl, twitchId + '');
    }
    await conn.execute('UPDATE streamer SET online=?,title=?,viewer=?,preview=?,preview_webp=?,preview_jpeg_2000=? WHERE twitch_id = ?', [online, title, viewer, orig, webp, jp2, twitchId]);
    await conn.end();
}

export async function removeStreamer(id: number): Promise<void> {
    const conn = await getConn();
    const [rows] = await conn.execute<Streamer[]>('SELECT preview, preview_webp as previewWEBP, preview_jpeg_2000 as previewJP2 FROM streamer WHERE id = ?;', [id]);
    if(rows.length > 0) {
        const streamer = rows[0];
        streamer.preview.length > 0 && removeFile(streamer.preview);
        streamer.previewWEBP.length > 0 && removeFile(streamer.previewWEBP);
        streamer.previewJP2.length > 0 && removeFile(streamer.previewJP2);
    }
    await conn.execute('DELETE FROM streamer WHERE id = ?', [id]);
    await conn.end();
}

interface StreamerIdResponse extends RowDataPacket {
    twitchId: string;
}
export async function getStreamerIds(): Promise<string[]> {
    const conn = await getConn();
    const [rows] = await conn.execute<StreamerIdResponse[]>('SELECT twitch_id as twitchId FROM streamer');
    await conn.end();

    return rows.map(({twitchId}) => twitchId);
}
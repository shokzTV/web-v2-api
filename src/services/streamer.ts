import { RowDataPacket } from "mysql2";
import { getConn } from "../db";
import { removeFile, streamFile } from "./File";

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
    const [dataRows] = await conn.execute<Streamer[]>('SELECT id, name, title, viewer, preview, preview_webp as previewWEBP, preview_jpeg_2000 as previewJP2, order, online FROM streamer;');
    await conn.end();

    return dataRows;
}

export async function getOnlineStreamer(): Promise<Streamer[]> {
    const conn = await getConn();
    const [dataRows] = await conn.execute<Streamer[]>('SELECT id, name, title, viewer, preview, preview_webp as previewWEBP, preview_jpeg_2000 as previewJP2, order FROM streamer WHERE online = TRUE;');
    await conn.end();

    return dataRows;
}

export async function createStreamer(name: string): Promise<void> {
    const conn = await getConn();
    await conn.execute("INSERT INTO streamer (id, name, title, viewer, preview, preview_webp, preview_jpeg_2000, order) VAUES(NULL, ?, '', 0, '', '', '', 0)", [name]);
    await conn.end();
}

export async function updateStreamerStatus(id: number, online: Boolean, title: string, viewer: number, previewUrl: string): Promise<void> {
    const conn = await getConn();
    let orig = '', webp = '', jp2 = '';
    if(online) {
        const [rows] = await conn.execute<Streamer[]>('SELECT preview, preview_webp as previewWEBP, preview_jpeg_2000 as previewJP2 FROM streamer WHERE id = ?;', [id]);
        const streamer = rows[0];
        streamer.preview.length > 0 && removeFile(streamer.preview);
        streamer.previewWEBP.length > 0 && removeFile(streamer.previewWEBP);
        streamer.previewJP2.length > 0 && removeFile(streamer.previewJP2);
        [webp, jp2, orig] = await streamFile('streamerPreview', previewUrl, id + '');
    }
    await conn.execute('UPDATE streamer SET online=?,title=?,viewer=?,preview=?,preview_webp=?,preview_jpeg_2000=? WHERE id = ?', [online, title, viewer, orig, webp, jp2, id]);
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
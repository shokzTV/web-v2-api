import uuid from 'uuid/v5';
import fs from 'fs';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { UploadedFile } from 'express-fileupload';

type FileTypes = 'videoThumbs' | 'tags' | 'covers' | 'userAvatar' | 'organizer/icon' | 'organizer/logo' | 'organizer/eventlogo';

function buildPathWithType(type: FileTypes, identifier: string, name: string): string {
    return `${buildPath(type, identifier)}${getFileType(name)}`;
}
function buildPath(type: FileTypes, identifier: string): string {
    const imgHash = uuid(identifier, uuid.URL);
    return `/static/${type}/${imgHash}`;
}

function getFileType(name: string): string {
    return name.substring(name.lastIndexOf('.'));
}

export async function streamFile(type: FileTypes, url: string, identifier: string, ): Promise<string> {
    const relativePath = buildPathWithType('videoThumbs', identifier, url);
    const path = __dirname + `/../..${relativePath}`;
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on('error', (err: string) => reject(err));
        fileStream.on('finish', () => resolve());
    });

    return relativePath;
}

interface Dimensions {
    width?: number;
    height?: number;
}

export async function saveFormFile(type: FileTypes, identifier: string, file: UploadedFile, dimenstions: Dimensions = { width: 512, height: 288 }): Promise<string> {
    const relativePath = buildPath(type, identifier) + '.png';

    await sharp(file.data)
            .png()
            .resize(dimenstions)
            .toFile(__dirname + `/../..${relativePath}`);

    return relativePath;
}

export async function removeFile(path: string): Promise<void> {
    fs.unlinkSync(__dirname + `/../..${path}`);
}
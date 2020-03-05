import uuid from 'uuid/v5';
import fs from 'fs';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { UploadedFile } from 'express-fileupload';
import imagemagick from 'imagemagick';
import { resolve } from 'dns';

type FileTypes = 'videoThumbs' | 'tags' | 'covers' | 'userAvatar' | 'organizer/icon' | 'organizer/logo' | 'organizer/eventlogo' | 'banner';

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

export async function streamFile(type: FileTypes, url: string, identifier: string, ): Promise<[string, string]> {
    const relativePath = buildPathWithType('videoThumbs', identifier, url);
    const path = __dirname + `/../..${relativePath}`;
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on('error', (err: string) => reject(err));
        fileStream.on('finish', () => resolve());
    });

    const image = sharp(path);
    const fileHash = relativePath.substring(0, relativePath.lastIndexOf('.'));
    if(!relativePath.endsWith('.webp')) {
        await image.webp().toFile(__dirname + '/../..' + fileHash + '.webp');
    }
    if(!relativePath.endsWith('.jp2')) {
        await new Promise((resolve) => {
            imagemagick.convert([path, '-quality', '0', __dirname + '/../..' + fileHash + '.jp2'], () => resolve());
        });
    }

    return [fileHash + '.webp', fileHash + '.jp2'];
}

interface Dimensions {
    width?: number;
    height?: number;
}

export async function saveFormFile(type: FileTypes, identifier: string, file: UploadedFile, dimenstions: Dimensions = { width: 512, height: 288 }): Promise<[string, string]> {
    const webPPath = buildPath(type, identifier) + '.webp';
    const jp2Path = buildPath(type, identifier) + '.jp2';

    await sharp(file.data)
            .webp()
            .resize(dimenstions)
            .toFile(__dirname + `/../..${webPPath}`);


    await new Promise((resolve) => {
        imagemagick.convert([__dirname + `/../..${webPPath}`, '-quality', '0', __dirname + `/../..${jp2Path}`], () => {
            resolve();
        });
    });

    return [webPPath, jp2Path];
}

export async function removeFile(path: string): Promise<void> {
    fs.unlinkSync(__dirname + `/../..${path}`);
}
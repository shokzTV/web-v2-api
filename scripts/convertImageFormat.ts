const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const imagemagick = require('imagemagick');


async function convertFolderImages(path) {
    const files = fs.readdirSync(path);
    for(let index of files) {
        const file = files[index];

        if(file.includes('_orig')) {
            fs.unlink(path + '/' + file, () => console.log('Deleted ' + file));
        } else {
            const image = sharp(path + '/' + file);
            const fileHash = file.substring(file, file.lastIndexOf('.'));
            if(!file.endsWith('.webp')) {
                await image.webp().toFile(path + '/' + fileHash + '.webp');
            }
            if(!file.endsWith('.jp2')) {
                await new Promise((resolve) => {
                    imagemagick.convert([path + '/' + file, '-quality', '0', path + '/' + fileHash + '.jp2'], () => resolve());
                });
            }

            if(!file.endsWith('.webp') && !file.endsWith('.jp2')) {
                fs.unlinkSync(path + '/' + file, () => console.log('Deleted ' + file));
            }
        }
    }
}

convertFolderImages(__dirname + '/../static/banner');
convertFolderImages(__dirname + '/../static/covers');
convertFolderImages(__dirname + '/../static/organizer/eventlogo');
convertFolderImages(__dirname + '/../static/organizer/icon');
convertFolderImages(__dirname + '/../static/organizer/logo');
convertFolderImages(__dirname + '/../static/tags');
convertFolderImages(__dirname + '/../static/userAvatar');
convertFolderImages(__dirname + '/../static/videoThumbs');
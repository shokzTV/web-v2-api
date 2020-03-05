const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const imagemagick = require('imagemagick');


function convertFolderImages(path) {
    fs.readdir(path, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 

        files.forEach(function (file) {
            if(file.includes('_orig')) {
                fs.unlink(path + '/' + file, () => console.log('Deleted ' + file));
            } else {
                const image = sharp(path + '/' + file);
                const fileHash = file.substring(file, file.lastIndexOf('.'));
                if(!file.endsWith('.webp')) {
                    image.webp().toFile(path + '/' + fileHash + '.webp');
                }
                if(!file.endsWith('.jp2')) {
                    imagemagick.convert([path + '/' + file, '-quality', '0', path + '/' + fileHash + '.jp2']);
                }

                if(!file.endsWith('.webp') && !file.endsWith('.jp2')) {
                    fs.unlink(path + '/' + file, () => console.log('Deleted ' + file));
                }
            }
        });
    });
}

convertFolderImages(__dirname + '/../static/banner');
convertFolderImages(__dirname + '/../static/covers');
convertFolderImages(__dirname + '/../static/event/banner');
convertFolderImages(__dirname + '/../static/organizer/eventlogo');
convertFolderImages(__dirname + '/../static/organizer/icon');
convertFolderImages(__dirname + '/../static/organizer/logo');
convertFolderImages(__dirname + '/../static/tags');
convertFolderImages(__dirname + '/../static/userAvatar');
convertFolderImages(__dirname + '/../static/videoThumbs');
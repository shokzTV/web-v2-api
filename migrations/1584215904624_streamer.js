module.exports = {
    "up": "CREATE TABLE streamer (id int PRIMARY KEY NOT NULL AUTO_INCREMENT, name varchar(191) NOT NULL, online boolean, viewer int, title varchar(191) NOT NULL, preview varchar(191) NOT NULL, preview_webp varchar(191) NOT NULL, preview_jpeg_2000 varchar(191) NOT NULL, sort_order int);",
    "down": "DROP TABLE streamer"
}
module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            ALTER TABLE article RENAME COLUMN cover TO cover_webp, ADD cover_jpeg_2000 VARCHAR(191) NOT NULL;
            ALTER TABLE event RENAME COLUMN banner TO banner_webp, ADD banner_jpeg_2000 VARCHAR(191) NOT NULL,
            RENAME COLUMN organizer_logo TO organizer_logo_webp, ADD organizer_logo_jpeg_2000 VARCHAR(191) NOT NULL;
            ALTER TABLE organizer RENAME COLUMN logo_small TO icon_webp, ADD icon_jpeg_2000 VARCHAR(191) NOT NULL,
            RENAME COLUMN logo TO logo_webp, ADD logo_jpeg_2000 VARCHAR(191) NOT NULL;
            ALTER TABLE tag RENAME COLUMN image TO image_webp, ADD image_jpeg_2000 VARCHAR(191) NOT NULL;
            ALTER TABLE user RENAME COLUMN avatar TO avatar_webp, ADD avatar_jpeg_2000 VARCHAR(191) NOT NULL;
            ALTER TABLE video RENAME COLUMN thumbnail TO thumbnail_webp, ADD thumbnail_jpeg_2000 VARCHAR(191) NOT NULL;

            UPDATE article SET cover_webp = CONCAT(SUBSTRING_INDEX(cover_webp, '.', 1), '.webp'), cover_jpeg_2000 = CONCAT(SUBSTRING_INDEX(cover_webp, '.', 1), '.jp2') WHERE cover_webp != '';
            UPDATE event SET banner_webp = CONCAT(SUBSTRING_INDEX(banner_webp, '.', 1), '.webp'), banner_jpeg_2000 = CONCAT(SUBSTRING_INDEX(banner_webp, '.', 1), '.jp2') WHERE banner_webp != '';
            UPDATE event SET organizer_logo_webp = CONCAT(SUBSTRING_INDEX(organizer_logo_webp, '.', 1), '.webp'), organizer_logo_jpeg_2000 = CONCAT(SUBSTRING_INDEX(organizer_logo_webp, '.', 1), '.jp2') WHERE organizer_logo_webp != '';
            UPDATE organizer SET icon_webp = CONCAT(SUBSTRING_INDEX(icon_webp, '.', 1), '.webp'), icon_jpeg_2000 = CONCAT(SUBSTRING_INDEX(icon_webp, '.', 1), '.jp2') WHERE icon_webp != '';
            UPDATE organizer SET logo_webp = CONCAT(SUBSTRING_INDEX(logo_webp, '.', 1), '.webp'), logo_jpeg_2000 = CONCAT(SUBSTRING_INDEX(logo_webp, '.', 1), '.jp2') WHERE logo_webp != '';
            UPDATE tag SET image_webp = CONCAT(SUBSTRING_INDEX(image_webp, '.', 1), '.webp'), image_jpeg_2000 = CONCAT(SUBSTRING_INDEX(image_webp, '.', 1), '.jp2') WHERE image_webp != '';
            UPDATE user SET avatar_webp = CONCAT(SUBSTRING_INDEX(avatar_webp, '.', 1), '.webp'), avatar_jpeg_2000 = CONCAT(SUBSTRING_INDEX(avatar_webp, '.', 1), '.jp2') WHERE avatar_webp != '';
            UPDATE video SET thumbnail_webp = CONCAT(SUBSTRING_INDEX(thumbnail_webp, '.', 1), '.webp'), thumbnail_jpeg_2000 = CONCAT(SUBSTRING_INDEX(thumbnail_webp, '.', 1), '.jp2') WHERE thumbnail_webp != '';
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": (conn, cb) => {
        conn.query(`
            ALTER TABLE article RENAME COLUMN cover_webp TO cover, DROP cover_jpeg_2000;
            ALTER TABLE event RENAME COLUMN banner_webp TO banner, DROP banner_jpeg_2000;
            ALTER TABLE event RENAME COLUMN organizer_logo_webp TO organizer_logo, DROP organizer_logo_jpeg_2000;
            ALTER TABLE organizer RENAME COLUMN icon_webp TO logo_small, DROP icon_jpeg_2000;
            ALTER TABLE organizer RENAME COLUMN logo_webp TO logo, DROP logo_jpeg_2000;
            ALTER TABLE tag RENAME COLUMN image_webp TO image, DROP image_jpeg_2000;
            ALTER TABLE user RENAME COLUMN avatar_webp TO avatar, DROP avatar_jpeg_2000;
            ALTER TABLE video RENAME COLUMN thumbnail_webp TO thumbnail, DROP thumbnail_jpeg_2000;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
}
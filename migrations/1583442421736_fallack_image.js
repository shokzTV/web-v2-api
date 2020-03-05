module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            ALTER TABLE article ADD cover VARCHAR(191) NOT NULL;
            ALTER TABLE event ADD banner VARCHAR(191) NOT NULL, ADD organizer_logo VARCHAR(191) NOT NULL;
            ALTER TABLE organizer ADD icon VARCHAR(191) NOT NULL, ADD logo VARCHAR(191) NOT NULL;
            ALTER TABLE tag ADD image VARCHAR(191) NOT NULL;
            ALTER TABLE user ADD avatar VARCHAR(191) NOT NULL;
            ALTER TABLE video ADD thumbnail VARCHAR(191) NOT NULL;

            UPDATE article SET cover = CONCAT(SUBSTRING_INDEX(cover_webp, '.', 1), '.jpeg') WHERE cover_webp != '';
            UPDATE event SET banner = CONCAT(SUBSTRING_INDEX(banner_webp, '.', 1), '.jpeg') WHERE banner_webp != '';
            UPDATE event SET organizer_logo = CONCAT(SUBSTRING_INDEX(organizer_logo_webp, '.', 1), '.jpeg') WHERE organizer_logo_webp != '';
            UPDATE organizer SET icon = CONCAT(SUBSTRING_INDEX(icon_webp, '.', 1), '.png') WHERE icon_webp != '';
            UPDATE organizer SET logo = CONCAT(SUBSTRING_INDEX(logo_webp, '.', 1), '.png') WHERE logo_webp != '';
            UPDATE tag SET image = CONCAT(SUBSTRING_INDEX(image_webp, '.', 1), '.jpeg') WHERE image_webp != '';
            UPDATE user SET avatar = CONCAT(SUBSTRING_INDEX(avatar_webp, '.', 1), '.jpeg') WHERE avatar_webp != '';
            UPDATE video SET thumbnail = CONCAT(SUBSTRING_INDEX(thumbnail_webp, '.', 1), '.jpeg') WHERE thumbnail_webp != '';
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": (conn, cb) => {
        conn.query(`
            ALTER TABLE article DROP cover;
            ALTER TABLE event DROP banner, DROP organizer_logo;
            ALTER TABLE organizer DROP icon, DROP logo;
            ALTER TABLE tag DROP image;
            ALTER TABLE user DROP avatar;
            ALTER TABLE video DROP thumbnail;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
}
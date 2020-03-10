module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            ALTER TABLE article DROP cover_jpeg_xr;
            ALTER TABLE event DROP banner_jpeg_xr;
            ALTER TABLE event DROP organizer_logo_jpeg_xr;
            ALTER TABLE organizer DROP icon_jpeg_xr;
            ALTER TABLE organizer DROP logo_jpeg_xr;
            ALTER TABLE tag DROP image_jpeg_xr;
            ALTER TABLE user DROP avatar_jpeg_xr;
            ALTER TABLE video DROP thumbnail_jpeg_xr;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": (conn, cb) => {
        conn.query(`
            ALTER TABLE article ADD cover_jpeg_xr VARCHAR(191) NOT NULL;
            ALTER TABLE event ADD banner_jpeg_xr VARCHAR(191) NOT NULL, ADD organizer_logo_jpeg_xr VARCHAR(191) NOT NULL;
            ALTER TABLE organizer ADD icon_jpeg_xr VARCHAR(191) NOT NULL, ADD logo_jpeg_xr VARCHAR(191) NOT NULL;
            ALTER TABLE tag ADD image_jpeg_xr VARCHAR(191) NOT NULL;
            ALTER TABLE user ADD avatar_jpeg_xr VARCHAR(191) NOT NULL;
            ALTER TABLE video ADD thumbnail_jpeg_xr VARCHAR(191) NOT NULL;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
}
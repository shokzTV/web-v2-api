module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            ALTER TABLE event ADD organizer_logo VARCHAR(191) NOT NULL;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": (conn, cb) => {
        conn.query(`
        ALTER TABLE event DROP organizer_logo;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
}



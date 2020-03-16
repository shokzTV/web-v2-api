module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            ALTER TABLE article ADD slug VARCHAR(191) NOT NULL;
            ALTER TABLE tag ADD slug VARCHAR(191) NOT NULL;
            ALTER TABLE event ADD slug VARCHAR(191) NOT NULL;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": (conn, cb) => {
        conn.query(`
            ALTER TABLE article DROP slug;
            ALTER TABLE tag DROP slug;
            ALTER TABLE event DROP slug;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
}
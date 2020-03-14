module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            ALTER TABLE article ADD published datetime DEFAULT NULL;
            UPDATE article SET published = created;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": "ALTER TABLE article DROP published;"
}
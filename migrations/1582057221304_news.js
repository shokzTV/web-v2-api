module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            CREATE TABLE news (id int NOT NULL AUTO_INCREMENT, user_id int NOT NULL, headline varchar(191) NOT NULL, description mediumtext NOT NULL, source varchar(191) NOT NULL, created datetime NOT NULL, PRIMARY KEY (id), KEY fkIdx_99 (user_id), CONSTRAINT FK_99 FOREIGN KEY fkIdx_99 (user_id) REFERENCES user (id));
            INSERT INTO \`right\` (name, ident) VALUES ('Add news', 'NEWS_CREATE'), ('Edit news', 'NEWS_EDIT'), ('Delete news', 'NEWS_DELETE');
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": (conn, cb) => {
        conn.query(`
            DROP TABLE news;
            DELETE FROM \`right\` WHERE ident IN ('NEWS_CREATE', 'NEWS_EDIT', 'NEWS_DELETE');
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
}
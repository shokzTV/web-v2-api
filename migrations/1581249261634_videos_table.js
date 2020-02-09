module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            CREATE TABLE video (id int NOT NULL, source text NOT NULL, title varchar(191) NOT NULL, description varchar(191) NOT NULL, thumbnail varchar(191) NOT NULL, PRIMARY KEY (id));
            CREATE TABLE video_tags (tag_id int NOT NULL, video_id int NOT NULL, PRIMARY KEY (tag_id, video_id), KEY fkIdx_45 (tag_id), CONSTRAINT FK_45 FOREIGN KEY fkIdx_45 (tag_id) REFERENCES tag (id), KEY fkIdx_51 (video_id), CONSTRAINT FK_51 FOREIGN KEY fkIdx_51 (video_id) REFERENCES video (id));
            INSERT INTO \`right\` (name, ident) VALUES ('Add videos', 'VIDEO_CREATE'), ('Edit videos', 'VIDEO_EDIT'), ('Delete videos', 'VIDEO_DELETE');
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": (conn, cb) => {
        conn.query(`
        DROP TABLE IF EXISTS video_tags;
        DROP TABLE IF EXISTS video;
        DELETE FROM \`right\` where ident IN ('VIDEO_CREATE', 'VIDEO_EDIT', 'VIDEO_DELETE');
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
}



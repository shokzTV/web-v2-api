module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            CREATE TABLE tag (id int NOT NULL, name varchar(191) NOT NULL, image varchar(191) NOT NULL, PRIMARY KEY (id));
            CREATE TABLE role (id int NOT NULL, name varchar(191) NOT NULL, PRIMARY KEY (id));
            CREATE TABLE \`right\` (id int NOT NULL, name  varchar(191) NOT NULL, ident varchar(191) NOT NULL, PRIMARY KEY (id));
            CREATE TABLE user (id int NOT NULL, twitch_id int NOT NULL, display_name varchar(191) NOT NULL, avatar varchar(191) NOT NULL, profile_url varchar(191) NOT NULL, custom_title varchar(191) NOT NULL, PRIMARY KEY (id));
            CREATE TABLE role_rights (right_id int NOT NULL, role_id int NOT NULL, PRIMARY KEY (right_id, role_id), KEY fkIdx_17 (role_id), CONSTRAINT FK_17 FOREIGN KEY fkIdx_17 (role_id) REFERENCES role (id), KEY fkIdx_22 (right_id), CONSTRAINT FK_22 FOREIGN KEY fkIdx_22 (right_id) REFERENCES \`right\` (id));
            CREATE TABLE user_roles (user_id int NOT NULL, role_id int NOT NULL, PRIMARY KEY (user_id, role_id), KEY fkIdx_21 (user_id), CONSTRAINT FK_21 FOREIGN KEY fkIdx_21 (user_id) REFERENCES user (id), KEY fkIdx_26 (role_id), CONSTRAINT FK_26 FOREIGN KEY fkIdx_26 (role_id) REFERENCES role (id));
            CREATE TABLE article (id int NOT NULL, title varchar(191) NOT NULL, author int NOT NULL, created datetime NOT NULL, cover varchar(191) NOT NULL, body longtext NOT NULL, status enum('draft', 'published', 'hidden') NOT NULL, PRIMARY KEY (id), KEY fkIdx_73 (author), CONSTRAINT FK_73 FOREIGN KEY fkIdx_73 (author) REFERENCES user (id));
            CREATE TABLE sources (id integer NOT NULL, article_id int NOT NULL, type enum('source', 'video', 'article') NOT NULL, reference varchar(191) NOT NULL, PRIMARY KEY (id), KEY fkIdx_50 (article_id), CONSTRAINT FK_50 FOREIGN KEY fkIdx_50 (article_id) REFERENCES article (id));
            CREATE TABLE article_tags (article_id int NOT NULL, tag_id int NOT NULL, PRIMARY KEY (article_id, tag_id), KEY fkIdx_14 (tag_id), CONSTRAINT FK_14 FOREIGN KEY fkIdx_14 (tag_id) REFERENCES tag (id), KEY fkIdx_37 (article_id), CONSTRAINT FK_37 FOREIGN KEY fkIdx_37 (article_id) REFERENCES article (id));
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": (conn, cb) => {
        conn.query(`
            DROP TABLE IF EXISTS article_tags; 
            DROP TABLE IF EXISTS sources;
            DROP TABLE IF EXISTS article;
            DROP TABLE IF EXISTS user_roles;
            DROP TABLE IF EXISTS role_rights;
            DROP TABLE IF EXISTS user;
            DROP TABLE IF EXISTS role;
            DROP TABLE IF EXISTS tag;
            DROP TABLE IF EXISTS \`right\`;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
}
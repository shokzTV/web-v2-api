module.exports = {
    "up": (conn, cb) => {
        conn.query(`
            CREATE TABLE organizer (id integer NOT NULL AUTO_INCREMENT, name varchar(191) NOT NULL, logo_small varchar(191) NOT NULL, logo varchar(191) NOT NULL, description longtext NOT NULL, PRIMARY KEY (id));
            CREATE TABLE event (id integer NOT NULL AUTO_INCREMENT, organizer_id integer NOT NULL, name varchar(191) NOT NULL, description_short text NOT NULL, start datetime NULL, end datetime NULL, country varchar(2) NOT NULL, location varchar(191) NOT NULL, price_pool varchar(191) NOT NULL, banner varchar(191) NOT NULL, description longtext NOT NULL, description_type enum('description', 'information', 'advice') NOT NULL, disclaimer longtext NOT NULL, is_featured bit(1) NOT NULL, is_main_event bit(1) NOT NULL, PRIMARY KEY (id), KEY fkIdx_65 (organizer_id), CONSTRAINT FK_65 FOREIGN KEY fkIdx_65 (organizer_id) REFERENCES organizer (id));
            CREATE TABLE event_tags (event_id integer NOT NULL, tag_id int NOT NULL, PRIMARY KEY (event_id, tag_id), KEY fkIdx_81 (event_id), CONSTRAINT FK_81 FOREIGN KEY fkIdx_81 (event_id) REFERENCES event (id), KEY fkIdx_85 (tag_id), CONSTRAINT FK_85 FOREIGN KEY fkIdx_85 (tag_id) REFERENCES tag (id));
            CREATE TABLE event_links (id integer NOT NULL AUTO_INCREMENT, event_id integer NOT NULL, link_type enum('homepage', 'liquipedia', 'custom') NOT NULL, name varchar(191) NOT NULL, link varchar(191) NOT NULL, PRIMARY KEY (id), KEY fkIdx_91 (event_id), CONSTRAINT FK_91 FOREIGN KEY fkIdx_91 (event_id) REFERENCES event (id));
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
    "down": (conn, cb) => {
        conn.query(`
            DROP TABLE IF EXISTS event_links;
            DROP TABLE IF EXISTS event_tags;
            DROP TABLE IF EXISTS event;
            DROP TABLE IF EXISTS organizer;
        `, (err) => {
            if(err) {
                console.error(err);
            }
            cb();
        })
    },
}



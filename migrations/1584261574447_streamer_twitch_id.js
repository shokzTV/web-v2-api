module.exports = {
    "up": "ALTER TABLE streamer ADD twitch_id VARCHAR(191) NOT NULL;",
    "down": "ALTER TABLE streamer DROP twitch_id;"
}
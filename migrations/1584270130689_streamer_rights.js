module.exports = {
    "up": "INSERT INTO \`right\` (name, ident) VALUES ('Add streamer', 'STREAMER_CREATE'),('Remove streamer', 'STREAMER_REMOVE');",
    "down": "DELETE FROM \`right\` WHERE ident IN ('STREAMER_CREATE', 'STREAMER_REMOVE')"
}
module.exports = {
    "up": "ALTER TABLE tag ADD description text NOT NULL;",
    "down": "ALTER TABLE tag DROP description;"
}
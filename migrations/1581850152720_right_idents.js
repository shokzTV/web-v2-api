module.exports = {
    "up": "INSERT INTO \`right\` (name, ident) VALUES ('Add events', 'EVENT_CREATE'), ('Edit event', 'EVENT_EDIT'), ('Delete event', 'EVENT_DELETE'), ('Feature event', 'EVENT_FEATURE'), ('Change main event', 'EVENT_MAIN_EVENT'), ('Add organizer', 'ORGANIZER_CREATE'), ('Edit organizer', 'ORGANIZER_EDIT'), ('Delete organizer', 'ORGANIZER_DELETE')",
    "down": "DELETE FROM \`right\` where ident IN ('EVENT_CREATE', 'EVENT_EDIT', 'EVENT_DELETE', 'EVENT_FEATURE', 'EVENT_MAIN_EVENT', 'ORGANIZER_CREATE', 'ORGANIZER_EDIT', 'ORGANIZER_DELETE');"
}
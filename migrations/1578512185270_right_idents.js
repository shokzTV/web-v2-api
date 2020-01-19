module.exports = {
    "up": "INSERT INTO `right` (name, ident) VALUES ('Add articles', 'ARTICLE_CREATE'), ('Edit articles', 'ARTICLE_EDIT'), ('Delete articles', 'ARTICLE_DELETE'), ('Publish articles', 'ARTICLE_PUBLISH'), ('Unpublish articles', 'ARTICLE_UNPUBLISH'), ('Add guide', 'GUIDE_CREATE'), ('Edit guide', 'GUIDE_EDIT'), ('Delete guide', 'GUIDE_DELETE'), ('Admin access', 'ADMIN_ACCESS');",
    "down": "DELETE FROM `role_rights`;DELETE FROM `right`;"
}
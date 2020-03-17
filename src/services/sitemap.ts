import { getPublicArticleSlugs } from "./article";
import { getEventSlugs } from "./event";
import { getTagSlugs } from "./tag";

const staticPages = [
    '',
    'artikel',
    'events',
    'kurznachrichten',
    'videos',
    'impressum',
    'datenschutz',
    'kategorien'
]

const baseUrl = 'https://shokz.tv/';
export async function createSitemap() {
    let xml = ''
    xml += '<?xml version="1.0" encoding="UTF-8"?>'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    const lastModified = yyyy + '-' + mm + '-' + dd;

    for(let page of staticPages) {
        xml += '<url>';
        xml += `<loc>${baseUrl + page}</loc>`;
        xml += `<lastmod>${lastModified}</lastmod>`;
        xml += '</url>';
    }  

    const articleSlugs = await getPublicArticleSlugs();
    console.log(articleSlugs);
    for(let slug of articleSlugs) {
        xml += '<url>';
        xml += `<loc>${baseUrl + 'artikel/' + slug}</loc>`;
        xml += `<lastmod>${lastModified}</lastmod>`;
        xml += '</url>';
    }  

    const eventSlugs = await getEventSlugs();
    for(let slug of eventSlugs) {
        xml += '<url>';
        xml += `<loc>${baseUrl + 'event/' + slug}</loc>`;
        xml += `<lastmod>${lastModified}</lastmod>`;
        xml += '</url>';
    }  

    const tagSlugs = await getTagSlugs();
    for(let slug of tagSlugs) {
        xml += '<url>';
        xml += `<loc>${baseUrl + 'kategorie/' + slug}</loc>`;
        xml += `<lastmod>${lastModified}</lastmod>`;
        xml += '</url>';
    }  

    xml += '</urlset>'

    return xml;
}
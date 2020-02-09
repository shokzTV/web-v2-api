import api, { videosInterface } from 'twitch-api-v5';
import config from '../config';

api.clientID = config.twitch.clientId;

//#region <interfaces>
interface Video {
    _id: string;
    broadcast_id: number;
    broadcast_type: 'upload';
    channel: {
        _id: string;
        name: string;
        display_name: string;
    };
    created_at: string;
    description: string;
    description_html: string;
    fps: {
        [x: string]: number;
    }
    game: string;
    language: string;
    length: number;
    muted_segments: Array<{duration: number; offset: number}>
    preview: {
        large: string;
        medium: string;
        small: string;
        template: string;
    };
    published_at: string;
    resolutions: {
        [x: string]: string;
    };
    status: 'recorded';
    tag_list: string;
    thumbnails: {
        large: Array<{
            type: 'generated';
            url: string;
        }>;
        medium: Array<{
            type: 'generated';
            url: string;
        }>;
        small: Array<{
            type: 'generated';
            url: string;
        }>;
        template: Array<{
            type: 'generated';
            url: string;
        }>;
    };
    title: string;
    url: string;
    viewable: 'public';
    viewable_at: string | null;
    views: number;
}
//#endregion

//example url: https://www.twitch.tv/videos/542602733
export async function fetchVideoByUrl(url: string): Promise<Video> {
    const [, videoId] = url.match(/^https:\/\/www\.twitch\.tv\/videos\/(\d+)$/);
    return fetchVideo(videoId);
}

export async function fetchVideo(videoID: string): Promise<Video> {
    return new Promise((resolve, reject) => {
        api.videos.getVideo({videoID}, (err, response) => {
            if(err) {
                reject(err);
            }

            resolve(response);
        });
    });
}
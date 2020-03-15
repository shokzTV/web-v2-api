import api from 'twitch-api-v5';
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

interface ChannelStream {
    _id: number;
    game: string;
    broadcast_platform: 'live' | 'playlist';
    community_id: string;
    community_ids: string[];
    viewers: number;
    video_height: number;
    average_fps: number;
    delay: number;
    created_at: string;
    is_playlist: boolean;
    stream_type: 'live' | 'playlist';
    preview: {
        small: string;
        medium: string;
        large: string;
        template: string;
    },
    channel: {
        mature: boolean;
        status: string;
        broadcaster_language: string;
        broadcaster_software: string;
        display_name: string;
        game: string;
        language: string;
        _id: number;
        name: string;
        created_at: string;
        updated_at: string;
        partner: boolean;
        logo: string;
        video_banner: string;
        profile_banner: string;
        profile_banner_background_color: string;
        url: string;
        views: number;
        followers: number;
        broadcaster_type: string;
        description: string;
        private_video: boolean;
        privacy_options_enabled: boolean;
    }
}

export interface Stream {
    stream: ChannelStream | null;
}

export async function fetchUserStream(channelID: string): Promise<Stream> {
    return new Promise((resolve, reject) => {
        api.streams.channel({channelID}, (err, response) => {
            if(err) {
                reject(err);
            }
            resolve(response);
        });
    });
}

interface UserData {
    _id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email: string
}
interface UserDataResponse {
    users: Array<UserData>;
}
export async function fetchUser(name: string): Promise<UserDataResponse> {
    return new Promise((resolve, reject) => {
        api.users.usersByName({users: name}, (err, response) => {
            if(err) {
                reject(err);
            }
            resolve(response);
        });
    });
}
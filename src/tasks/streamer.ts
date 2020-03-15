import {green} from 'chalk';
import interval from 'interval-promise';
import { fetchUserStream, Stream } from '../services/twitchapi';
import grey from 'chalk';
import { updateStreamerStatus, getStreamerIds } from '../services/streamer';

console.log(green('📝 Registered streamer task'));

async function fetchWatchingStreamer(): Promise<string[]> {
    return await getStreamerIds();
}

async function updateStreamer(channelID: string): Promise<void> {
    const streamData = await fetchUserStream(channelID);
    if(streamData.stream && streamData.stream.channel.game === 'Dota 2') {
        console.log(grey(`🔴 ${channelID} | ${streamData.stream.channel.name} is live. [🎮${streamData.stream.game} | 👤${streamData.stream.viewers} | 📃${streamData.stream.channel.status}]`));
        await updateStreamerStatus(channelID, true, streamData.stream.channel.status, streamData.stream.viewers, streamData.stream.preview.medium);
    } else if(streamData.stream) {
        console.log(grey(`🔵 ${channelID} | ${streamData.stream.channel.name} is live but is playing 🎮${streamData.stream.game} - marked as offline.`));
        await updateStreamerStatus(channelID, false, '', 0, '');
    } else {
        console.log(grey(`💤 ${channelID} is offline`));
        await updateStreamerStatus(channelID, false, '', 0, '');
    }
}

async function startUpdate(): Promise<void> {
    const users = await fetchWatchingStreamer();
    if(users.length > 0) {
        console.log(grey('- Updating streamer database -'));
        for(let channelID of users) {
            await updateStreamer(channelID);
        }
        console.log(grey('- Finished updating streamer database -'));
    } 
}

interval(async () => startUpdate(), 30000);

startUpdate();
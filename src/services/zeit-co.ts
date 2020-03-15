import config from "../config";
import {cyanBright} from 'chalk';
import fetch from 'node-fetch';

export async function triggerDeploy(): Promise<void> {
    if(config.staticDeployHooks.triggerDeploy) {
        console.log(cyanBright('🏗️Rebuilding website'));
        await fetch(config.staticDeployHooks.triggerHookUrl, {method: 'POST'});
    }
}
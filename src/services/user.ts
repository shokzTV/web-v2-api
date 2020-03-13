import { User } from "../entities/User";
import { RowDataPacket, OkPacket } from "mysql2";
import { getConn } from "../db";
import { getUserRoleRights } from "./role";
import { streamFile } from "./File";

type UserResponse = User & RowDataPacket & OkPacket;

async function downloadUserAvatar(url: string, userId: number): Promise<[string, string, string]> {
    return await streamFile('userAvatar', url, '' + userId);
}

export async function findOrCreateUser(twitchId: number, displayName: string, avatar: string): Promise<User> {
    const conn = await getConn();
    let user = await loadUserByTwitchId(twitchId);

    if(! user) {
        const [webp, jp2, orig] = await downloadUserAvatar(avatar, twitchId);
        conn.execute<OkPacket>(
            "INSERT INTO user (id, twitch_id, display_name, avatar, avatar_webp, avatar_jpeg_2000, profile_url, custom_title) VALUES (NULL, ?, ?, ?, ?, ?, '', '');",
            [twitchId, displayName, orig, webp, jp2]
        );
        const [userRow] = await conn.query<UserResponse[]>('SELECT * FROM user WHERE twitch_id = ?;', [twitchId]);
        user = userRow[0];
    } else {
        user = await loadUserByTwitchId(twitchId);
    }

    await conn.end();
    return user!;
}

export async function loadUserByTwitchId(twitchId: number): Promise<User | null> {
    const conn = await getConn();
    const [userRows] = await conn.query<UserResponse[]>('SELECT * FROM user WHERE twitch_id = ?;', [twitchId]);
    let user = null;
    
    if(userRows.length === 1) {
        const userId = userRows[0].id;
        const rightRoles = await getUserRoleRights(userId);
        user = {
            ...userRows[0],
            roles: rightRoles
        };
    }
    await conn.end();

    return user;
}

export async function loadUserById(id: number): Promise<User | null> {
    const conn = await getConn();
    const [userRows] = await conn.query<UserResponse[]>('SELECT * FROM user WHERE id = ?;', [id]);
    let user = null;
    
    if(userRows.length === 1) {
        const userId = userRows[0].id;
        const rightRoles = await getUserRoleRights(userId);
        user = {
            ...userRows[0],
            roles: rightRoles
        };
    }
    await conn.end();

    return user;
}
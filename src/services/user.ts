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
        const profileUrl = 'https://twitch.tv/' + displayName;
        conn.execute<OkPacket>(
            "INSERT INTO user (id, twitch_id, display_name, avatar, avatar_webp, avatar_jpeg_2000, profile_url, custom_title) VALUES (NULL, ?, ?, ?, ?, ?, ?, '');",
            [twitchId, displayName, orig, webp, jp2, profileUrl]
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

export async function loadUsers(): Promise<User[]> {
    const conn = await getConn();
    const [userRows] = await conn.query<UserResponse[]>('SELECT u.id, u.twitch_id as twitchId, u.display_name as name, u.avatar_webp as avatarWEBP, u.profile_url as profileUrl, u.custom_title as customTitle, u.avatar_jpeg_2000 as avatarJP2, u.avatar as avatar, ur.role_id as role FROM user u LEFT JOIN user_roles ur ON ur.user_id = u.id;');
    await conn.end();

    return userRows;
}

export async function updateUserRole(userId: number, roleId: number): Promise<void> {
    const conn = await getConn();
    await conn.query('DELETE FROM user_roles WHERE user_id=?;', [userId]);
    await conn.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?);', [userId, roleId]);
    await conn.end();
}

export async function updateUser(userId: number, data: Partial<User>): Promise<void> {
    const conn = await getConn();
    if(data.customTitle) {
        await conn.query('UPDATE user SET custom_title=? WHERE user_id=?;', [data.customTitle, userId]);
    }
    if(data.displayName) {
        await conn.query('UPDATE user SET display_name=? WHERE user_id=?;', [data.displayName, userId]);
    }
    if(data.profileUrl) {
        await conn.query('UPDATE user SET profile_url=? WHERE user_id=?;', [data.profileUrl, userId]);
    }
    await conn.end();

}
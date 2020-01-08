import { getConn } from "../db";
import { RowDataPacket, OkPacket } from "mysql2";
import { Role } from "../entities/Role";
import { Right } from "../entities/Right";

type RoleResult = Role & RowDataPacket & OkPacket;
type RightsResult = Right & RowDataPacket & OkPacket & {
    roleId: number;
};

//#region <controller functions>

export async function getRoles(roleIds: number[] = []): Promise<RoleResult[]> {
    const conn = await getConn();
    const [roles] = await conn.query<RoleResult[]>(roleIds.length > 0 ? `SELECT * from role WHERE id IN (?)` : `SELECT * from role`, [roleIds]);
    const selectedRoleIds = roles.map(({id}) => id);
    const [roleRights] = await conn.query<RightsResult[]>(
        `SELECT rr.role_id as role, r.id, r.name, r.ident FROM role_rights rr INNER JOIN \`right\` r ON rr.right_id = r.id AND rr.role_id IN (?)`, 
        [selectedRoleIds]
    );

    await conn.end();

    return roles.map((role) => ({
        ...role,
        rights: roleRights.filter(({role: roleId}) => roleId === role.id).map(({id, name, ident}) => ({id, name, ident})),
    }));
}

export async function createRole(name: string): Promise<number> {
    const conn = await getConn();
    const [{insertId}] = await conn.execute<OkPacket>('INSERT INTO role (id, name) VALUES (NULL, ?)', [name]);
    await conn.end();
    return insertId;
}

//Idempotent function
export async function assignRight(roleId: number, rightId: number): Promise<void> {
    try {
        const conn = await getConn();
        await conn.execute<OkPacket>('INSERT INTO role_rights (role_id, right_id) VALUES (?, ?)', [roleId, rightId]);
        await conn.end();
    } catch(error) {
        console.error(error);
    }
}

//Idempotent function
export async function removeRight(roleId: number, rightId: number): Promise<void> {
    try {
        const conn = await getConn();
        await conn.execute<OkPacket>('DELETE FROM role_rights WHERE role_id = ? AND right_id = ?', [roleId, rightId]);
        await conn.end();
    } catch(error) {
        console.error(error);
    }
}

//#endregion

export async function getUserRoleRights(userId: number): Promise<RoleResult[]> {
    const conn = await getConn();
    const [roleIds] = await conn.query<(number & RowDataPacket & OkPacket)[]>('SELECT role_id as id FROM user_roles WHERE user_id = ?', [userId]);
    await conn.end();
    return await getRoles(roleIds.map(({id}) => id));
} 
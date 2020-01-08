import { getConn } from "../db";
import { RowDataPacket, OkPacket } from "mysql2";
import { Role } from "../entities/Role";
import { Right } from "../entities/Right";

type RoleResult = Role & RowDataPacket & OkPacket;
type RightsResult = Right & RowDataPacket & OkPacket & {
    roleId: number;
};

export async function getRoles(): Promise<RoleResult[]> {
    const conn = await getConn();
    const [roles] = await conn.query<RoleResult[]>(`SELECT * from role`);
    const [roleRights] = await conn.query<RightsResult[]>(`SELECT rr.role_id, r.id, r.name, r.ident FROM right_roles rr INNER JOIN \`right\` r`);
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
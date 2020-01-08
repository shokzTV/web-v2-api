import { Right } from "../entities/Right";
import { getConn } from "../db";
import { RowDataPacket, OkPacket } from "mysql2";

type RightResult = Right & RowDataPacket & OkPacket;

export async function getRights(): Promise<RightResult[]> {
    const conn = await getConn();
    const [rights] = await conn.query<RightResult[]>(`SELECT * from \`right\``);
    return rights;
}

//There is no service to create a right as this is handled internally
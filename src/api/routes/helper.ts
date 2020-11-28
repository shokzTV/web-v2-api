import { Request } from "express";

export function getArrayFromBody<T = string>(type: T | T[]): T[] {
    if(! type) {
        return [];
    }
    if(!(type instanceof Array)) {
        return [type];
    }
    return type;
}

export function getIdsFromRequest(req: Request): number[] {
    return req.query.ids ? (req.query.ids as string[]).map((id: string) => +id) : [];
}
import { Request } from "express";

export function getTagsFromBody(tags: string | string[]): string[] {
    if(typeof tags === 'string') {
        return [tags];
    }
    return tags;
}

export function getIdsFromRequest(req: Request): number[] {
    return req.query.ids ? req.query.ids.map((id: string) => +id) : [];
}
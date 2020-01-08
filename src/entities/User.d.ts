import { Role } from "./Role";

export interface User {
    id: number;
    twitchId: number;
    displayName: string;
    created: number;
    avatar: string;
    profileUrl: string;
    customTitle: string;
    roles: Role[];
}
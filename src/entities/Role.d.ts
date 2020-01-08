import { Right } from "./Right";

export interface Role {
    id: number;
    name: string;
    rights?: Right[];
}
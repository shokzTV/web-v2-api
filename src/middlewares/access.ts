import { Request, Response, NextFunction } from "express"
import { User } from "../entities/User";

export const checkUserRole = (roleIdent: string) => (req: Request, res: Response, next: NextFunction) => {
    if(!req.user) {
        return res.status(401).json('unauthorized').end();
    }

    if(! (req.user as User).roles.find(({rights}) => rights?.find(({ident}) => ident === roleIdent))) {
        return res.status(403).json('forbidden').end();
    }

    return next();
}
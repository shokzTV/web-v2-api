import { Request, Response, NextFunction } from "express"
import { User } from "../entities/User";

export const checkUserRole = (roleIdent: string) => (req: Request, res: Response, next: NextFunction) => {
    if(!req.user) {
        return res.json({msg: 'Unauthorized'}).status(401).end();
    }

    if(! (req.user as User).roles.find(({rights}) => rights?.find(({ident}) => ident === roleIdent))) {
        return res.json({msg: 'Forbidden'}).status(403).end();
    }

    return next();
}
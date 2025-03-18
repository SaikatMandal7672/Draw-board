import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const middleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers["authorization"];

    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.log("JWT_SECRET missing");
        res.status(500).json({ message: "JWT_SECRET missing in environment variables" });
        return; 
    }

    try {
        const decoded = jwt.verify(token, secret); // Can be string | JwtPayload

        if (typeof decoded === "string") {
            res.status(401).json({ message: "Invalid token format" });
            return;
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};

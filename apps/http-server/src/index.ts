import express, { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken"
const app = express();
import dotenv from "dotenv";
import { middleware } from "./middleware";

dotenv.config();
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Hello, World!"  // Just an example response
    });
});

app.post('/signup', (req: Request, res: Response) => {

})
app.post('/signin', (req: Request, res: Response) => {

    const userId = req.body.userId;
    if (!process.env.JWT_SECRET) {
        res.status(500).json({ error: "JWT_SECRET is not defined" });
        return;
    }
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);
})
app.post('/create-room', middleware , (req: Request, res: Response) => {

})

app.listen(3001, () => {
    console.log("Server running on port 3001");
});

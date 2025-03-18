import express, { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken"
const app = express();
import { JWT_SECRET } from "be-common/config";
import { middleware } from "./middleware";
import { SignInSchema, SignUpSchema } from "@repo/common/type"
import bcrypt from "bcrypt"
import { prismaClient } from "@repo/db"

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Hello, World!"  // Just an example response
    });
});

app.post('/signup', async (req: Request, res: Response) => {
    const parsedData = SignUpSchema.safeParse(req.body)

    if (!parsedData.success) {
        res.status(400).json({
            success: false,
            message: 'Incorrect inputs provided'
        })
        return;
    }

    const hashedPassword = await bcrypt.hash(req.body.hashedPassword, 10);
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.email,
                password: hashedPassword,
                username: parsedData.data.username
            }
        })
        res.status(200).json({
            success: true,
            message: 'User Created Successfully'
        })
        return;
    } catch (error) {
        console.log("\n ", error, '\n')
        const errorMessage = (error as Error).message;
        res.status(500).json({
            success: false,
            message: errorMessage
        })
        return;
    }



})
app.post('/signin', async (req: Request, res: Response) => {
    const parsedData = SignInSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            success: false,
            message: 'Incorrect inputs provided'
        })
        return;
    }

    try {

        const user = await prismaClient.user.findFirst({
            where: {
                OR: [
                    {
                        email: parsedData.data?.identifier,
                        password: parsedData.data?.password

                    },
                    {
                        username: parsedData.data?.identifier,
                        password: parsedData.data?.password

                    }
                ]
            }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "User not found with the provided credentials"
            });
            return;
        }
        const userId = user.id;
        if (!JWT_SECRET) {
            res.status(500).json({ error: "JWT_SECRET is not defined" });
            return;
        }
        const token = jwt.sign({ userId }, JWT_SECRET);
        res.status(200).json({
            sucess: true,
            message: "User found",
            token
        })
        return;

    } catch (error) {
        console.log("\n ", error, '\n')
        const errorMessage = (error as Error).message;
        res.status(500).json({
            success: false,
            message: errorMessage
        })
        return;
    }

})
app.post('/create-room', middleware, (req: Request, res: Response) => {

})

app.listen(3001, () => {
    console.log("Server running on port 3001");
});

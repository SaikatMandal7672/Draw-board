import express, { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken"
const app = express();
import { JWT_SECRET } from "be-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, SignInSchema, SignUpSchema } from "@repo/common/type"
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

    const existingUser = await prismaClient.user.findFirst({
        where: {
            OR: [
                {
                    email: parsedData.data?.email,


                },
                {
                    username: parsedData.data?.username,


                }
            ]
        }
    })
    if (existingUser) {
        res.status(409).json({
            success: false,
            message: "User already exists with the provided email or password"
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
            message: 'User Created Successfully',
            userId: user.id
        })
        return;
    } catch (error) {
        console.log("\n Signup error ", error, '\n')
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
                    },
                    {
                        username: parsedData.data?.identifier,
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
        const password = parsedData.data?.password;
        const comparePasword = await bcrypt.compare(password, user.password)
        if (!comparePasword) {
            res.status(401).json({
                success: false,
                message: "Incorrect password"
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
        console.log("\n Signin Error", error, '\n')
        const errorMessage = (error as Error).message;
        res.status(500).json({
            success: false,
            message: errorMessage
        })
        return;
    }

})
app.post('/create-room', middleware, async (req: Request, res: Response) => {
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.status(400).json({
            success: false,
            message: 'Incorrect inputs provided'
        })
        return;
    }

    const userId = req.userId;
    if (!userId) {
        res.status(400).json({
            success: false,
            message: 'User not authenticated'
        });
        return;
    }
    try {
        const room = await prismaClient.room.create({
            data: {
                slug: data.data?.name,
                adminId: userId
            }
        });
        res.status(200).json({
            sucess: true,
            message: "Room created successfully",
            roomId: room.id
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

app.listen(3001, () => {
    console.log("Server running on port 3001");
});

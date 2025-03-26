import express, { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken"
import cookiParser from "cookie-parser"
import { middleware } from "./middleware";
import { CreateRoomSchema, SignInSchema, SignUpSchema } from "@repo/common/type"
import bcrypt from "bcryptjs";
import { prismaClient } from "@repo/db"
import { JWT_SECRET } from "be-common/config";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Hello, World!"  // Just an example
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
            message: "User already exists with the provided email or username"
        })
        return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
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
            message: 'User Signed up Successfully',
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
        res.cookie("token",token,{
            httpOnly:true,
            sameSite:"lax",
            path:"/"
        })
        res.status(200).json({
            sucess: true,
            message: "User signed in",
            token
        })
        return;

    } catch (error) {
        console.log("\n Signin Error", error, '\n')
        const errorMessage = (error as Error).message + "| User signin Failed";
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
    const existingRoom = await prismaClient.room.findFirst({
        where: {
            slug: data.data?.name
        }
    })
    if (existingRoom) {
        res.status(409).json({
            success: false,
            message: "Room already exists. Provide a different name."
        })
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
app.post('/roomid',middleware ,async (req: Request, res: Response) => {
    const {name} = req.body

    try {
        const room = await prismaClient.room.findUnique({
            where: {
                slug:name
            }
        })
        if (!room) {
            res.status(408).json({
                success: false,
                message: "Room not found."
            })
            return;
        }
        res.status(200).json({
            sucess: true,
            message: "Room found",
            roomId: room.id
        })
    } catch (error) {
        res.status(500).json({
            sucess: false,
            message: "Server error.",
        })
    }

} )
app.get('/chats/:roomId',  async (req: Request, res: Response) => {
    const roomId = parseInt(req.params.roomId || "0");

    try {
        const chats = await prismaClient.chat.findMany({
            where: {
                roomId
            },
            orderBy: {
                createdAt: "asc"
            },
            take: 200
        })
        res.status(200).json({
            sucess: true,
            message: "Chats fetched successfully",
            data: chats
        })
    } catch (error) {
        res.status(500).json({
            sucess: false,
            message: "Server error. cannot fetch chats",
        })
    }

})
app.delete('/delete-room/:roomId', middleware, async (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    if (!roomId) {
        res.status(400).json({
            success: false,
            message: "Room Id not provided"
        })
        return;
    }
    const id = parseInt(roomId);
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({
            success: false,
            message: "User not authenticated"
        })
    }
    // check if room exists
    const room = await prismaClient.room.findFirst({
        where: {
            id
        }
    })
    if (!room) {
        res.status(408).json({
            success: false,
            message: "Room not found."
        })
        return;
    }
    // check if the user is the admin of the room
    const admin = await prismaClient.room.findFirst({
        where: {
            adminId: userId
        }
    })
    if (!admin) {
        res.status(400).json({
            success: false,
            message: "Only admins can delete room."
        })
        return;
    }
    const deletedRoom = await prismaClient.room.delete({
        where: {
            id, adminId: userId
        }
    })
    console.log(deletedRoom);
    res.status(200).json({
        success: true,
        message: `Room ${deletedRoom.slug}  deleted`
    })
})
app.listen(3001, () => {
    console.log("Server running on port 3001");
});

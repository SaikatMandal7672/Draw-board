import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from 'be-common/config';
import { prismaClient } from "@repo/db";
interface messageQueue {
    roomId: number;
    message: string;
    userId: string;
    username?: string;
}
const wss = new WebSocketServer({ port: 8080 });
const users = new Map(); // Use a Map for efficient lookups
const messageQueue: messageQueue[] = [];
const BATCH_SIZE = 5;

function checkUser(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return typeof decoded !== "string" && decoded?.userId ? decoded.userId : null;
    } catch {
        return null;
    }
}

async function processQueue() {
    if (messageQueue.length === 0) return;
    const batch = messageQueue.splice(0, BATCH_SIZE);
    await prismaClient.chat.createMany({ data: batch });
}
setInterval(processQueue, 200); // Run queue processing every 2 seconds

wss.on('connection', async (ws, request) => {
    ws.send(JSON.stringify({ message: "connected" }));
    //extract token from url
    const url = request.url;
    if (!url) return ws.close();
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    
    const userId = checkUser(token); // //check if token is valid and returns the userId saved on db 
    if (!userId) {
        ws.send(JSON.stringify({ success:false, message: "Cannot find user" }))
        return ws.close();}
    const userRecord = await prismaClient.user.findUnique({
        where: {
            id: userId
        },
        select: {
            username: true
        }
    });
    const username = userRecord?.username || null;
    if (!username) {
        ws.send(JSON.stringify({ success:false, message: "Cannot find username" }));
        return ws.close();
    }

    if (!users.has(userId)) {
        users.set(userId, { sockets: new Set(), rooms: new Set() });
      }
    const subUsers = users.get(userId);
    subUsers.sockets.add(ws);

    ws.on('message', async (data) => {
        try {
            
            const parsedData = JSON.parse(data.toString());
            console.log(parsedData)
            const user = users.get(userId); //  user obtained from the map

            if (!user) return;

            const roomId = Number(parsedData.roomId);
            const roomExists = await prismaClient.room.findUnique({
                where: {
                    id: roomId
                }
            });
            if (parsedData.type === "join_room" && roomExists) {
                
                user.rooms.add(parsedData.roomId);
            }
            else if (parsedData.type === "leave_room") {

                user.rooms.delete(parsedData.roomId);
            }
            else if (parsedData.type === "chat" && roomExists ) {
                console.log("control reached");
                
                const { roomId, message } = parsedData;
                messageQueue.push({ roomId: Number(roomId), message, userId, username });
                users.forEach(({ sockets, rooms }) => {
                    if (rooms.has(roomId)) {
                        sockets.forEach( (ws:WebSocket) =>{
                            ws.send(JSON.stringify({ type: "chat", message, roomId, username }));
                        })
                    }
                });

            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on('close', () => {
        ws.send(JSON.stringify({ message:"connection closed"}));
        ws.close()
    });
});

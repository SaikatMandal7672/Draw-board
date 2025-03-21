import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from 'be-common/config';
import { prismaClient } from "@repo/db";
interface messageQueue {
    roomId: number;
    message: string;
    userId: string;
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
setInterval(processQueue, 2000); // Run queue processing every 2 seconds

wss.on('connection', (ws, request) => {
    const url = request.url;
    if (!url) return ws.close();

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);
    if (!userId) return ws.close();

    users.set(userId, { ws, rooms: new Set() });

    ws.on('message', (data) => {
        try {
            const parsedData = JSON.parse(data.toString());
            console.log(parsedData)
            const user = users.get(userId);
            if (!user) return;

            if (parsedData.type === "join_room") {
                user.rooms.add(parsedData.roomId);
            } else if (parsedData.type === "leave_room") {
                user.rooms.delete(parsedData.roomId);
            } else if (parsedData.type === "chat") {
                const { roomId, message } = parsedData;
                messageQueue.push({ roomId: roomId, message, userId });
                users.forEach(({ ws, rooms }) => {
                    if (rooms.has(roomId)) {
                        ws.send(JSON.stringify({ type: "chat", message, roomId }));
                    }
                });
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on('close', () => {
        users.delete(userId);
    });
});

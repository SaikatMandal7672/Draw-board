import { WebSocketServer } from "ws"
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws,request) => {
    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    
    const secret = process.env.JWT_SECRET ;
    if(!secret){
        console.log("jwt secret missing from ws server");
        ws.close();
        return;
    }
    const decoded = jwt.verify(token,secret);
    if(!decoded || (decoded as JwtPayload).userId){
        console.log("user not authenticated . From ws server")
        ws.close();
        return;
    }
    ws.on('message', (data) => {
        ws.send("hey thereclea")
    })
})
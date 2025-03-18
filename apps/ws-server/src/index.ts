import { WebSocketServer } from "ws"
import jwt, { JwtPayload } from "jsonwebtoken";
import {JWT_SECRET} from "be-common/config"


const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws,request) => {
    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    
    
    if(!JWT_SECRET){
        console.log("jwt secret missing from ws server");
        ws.close();
        return;
    }
    const decoded = jwt.verify(token,JWT_SECRET);
    if(!decoded || (decoded as JwtPayload).userId){
        console.log("user not authenticated . From ws server")
        ws.close();
        return;
    }
    ws.on('message', (data) => {
        ws.send("hey thereclea")
    })
})
import { useEffect, useState } from "react";
import { WS_URL } from "be-common/config";
import { Socket } from "node:dgram";

export default function useSocket(token:string){
    const [ isLoading , setIsLoading] = useState(true);
    const [ socket , setSocket ] = useState<WebSocket>();
    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=${token}`)
        ws.onopen = ()=>{
            setIsLoading(false)
            setSocket(ws)
        }
    })
    console.log(socket);
    
    return {socket , isLoading}
}
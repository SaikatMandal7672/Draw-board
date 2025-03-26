import { useEffect, useState } from "react";
import { WS_URL } from "be-common/config";

export default function useSocket(token:string){
    const [ isLoading , setIsLoading] = useState(true);
    const [ socket , setSocket ] = useState<WebSocket>();
    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=${token}`)
        ws.onopen = ()=>{
            setIsLoading(false)
            setSocket(ws)
        }
    },[])

    return {socket , isLoading}
}
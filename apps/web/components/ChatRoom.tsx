'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { HTTP_URL } from 'be-common/config'

import useSocket from "../app/hooks/useSocket";
async function getChats(roomId: string) {
    const response = await axios.get(`${HTTP_URL}/chats/${roomId}`)
    return response;
}

const ChatRoom = ({ id }: { id: string }) => {
    const [currentMessage, setCurrentMessage] = useState("");
    const [chats, setChats] = useState<{ message: any }[]>([]);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") as string : "";


    const { socket, isLoading } = useSocket(token);
    if (socket) console.log("connected to ws-server")
    const sendMessage = (message:string) => {
        if(message !== "") {
        socket?.send(
            JSON.stringify({
                type: "chat",
                message,
                roomId: Number(id)
            })
        );
        setChats(c => [...c, { message }]);
        // setChats(c => [...c, { message: currentMessage }])
        }

    };

    useEffect(() => {
        const fetchChats = async () => {
            const response = await getChats(id);
            setChats(response.data.data);
        };

        fetchChats();

    }, [id]);
    useEffect(() => {
        // setChats(messages)
        if (socket && !isLoading) {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }));

            socket.onmessage = (event) => {
                console.log("onmessage working");
                
                const parsedData = JSON.parse(event.data);

                if (parsedData.type === "chat") {
                    setChats(c => [...c, { message: parsedData.message }]);
                }
            };
        }
    });

    return (
        <>
            <div>ChatRoom</div>
            <div className="bg-amber-100 p-10 w-auto flex flex-col">
                prev chats:-
                {chats.map((m, index) => (
                    <span className="border-black border px-4 py-2 m-1" key={index}>
                        {m.message}
                    </span>
                ))}

                <input
                    className="border rounded-lg border-black px-8 py-2"
                    type="text"
                    value={currentMessage}
                    onChange={e => setCurrentMessage(e.target.value)}
                />
                <button onClick={() => {
                    sendMessage(currentMessage)
                    setCurrentMessage("");
                    
                }}>
                    Send message
                </button>
            </div>

        </>
    );
}

export default ChatRoom;
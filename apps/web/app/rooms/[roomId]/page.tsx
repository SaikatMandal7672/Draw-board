"use client";
import useSocket from "@/app/hooks/useSocket";
import ChatRoom from "@/components/ChatRoom";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const ChatRooms = () => {
  console.log("ChatRooms component reloaded");


  const [token, setToken] = useState<string>("");
  const { roomId } = useParams() as { roomId: string };

  useEffect(() => {
    if (!token) {
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    }
  }, [token]); 

  const { socket, isLoading } = useSocket(token ?? ""); // Use token only if it's available

  console.log("Token:", token);

  return (
    <>
      <div>ChatRooms {roomId}</div>
     ]<ChatRoom id={roomId} />
    </>
  );
};

export default ChatRooms;

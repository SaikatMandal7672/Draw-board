"use client";
// import useSocket from "@/app/hooks/useSocket";
import ChatRoom from "@/components/ChatRoom";
import { useParams } from "next/navigation";
import React from "react";

const ChatRooms = () => {
  const { roomId } = useParams() as { roomId: string };



  return (
    <>
      <div>ChatRooms {roomId}</div>
     ]<ChatRoom id={roomId} />
    </>
  );
};

export default ChatRooms;

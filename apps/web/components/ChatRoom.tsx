import React from 'react'
import axios from 'axios'
import { HTTP_URL } from 'be-common/config'
async function getChats(roomId:string) {
    const response = await axios.get(`${HTTP_URL}/chats/${roomId}`)
    console.log(response.data)
}
const ChatRoom = async({ id }: { id: string }) => {
    
    await getChats(id);

    return (

        <div>ChatRoom</div>
    )
}

export default ChatRoom
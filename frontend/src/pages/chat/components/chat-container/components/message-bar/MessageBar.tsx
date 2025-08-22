import React ,{useEffect, useState} from 'react'
import {GrAttachment} from "react-icons/gr"
import { IoSend } from 'react-icons/io5'
import { RiEmojiStickerLine } from 'react-icons/ri'
import { useRef } from 'react'
import EmojiPicker, { Theme }  from "emoji-picker-react"
import type { EmojiClickData } from 'emoji-picker-react'
import { useChatStore, useUserStore } from '@/store/slices/auth-slice'
import { useSocket } from '@/context/SocketContext'
function MessageBar() {
    const [message,setMessage]=useState("")
    const emojiRef=useRef<HTMLDivElement>(null)
    const [emojiPickerOpen,setEmojiPickerOpen]=useState(false)
    const {selectedChatType,selectedChatData}=useChatStore()
    const socket=useSocket()
    const {userInfo}=useUserStore()

    const handleAddEmoji=async(emoji:EmojiClickData)=>{
        setMessage((msg)=>msg+emoji.emoji)
    }
    
    useEffect(()=>{
        function handleClickOutside(event:MouseEvent){
            if(emojiRef.current && !emojiRef.current.contains(event.target as Node)){
                    setEmojiPickerOpen(false);
            }
          
        }
        document.addEventListener("mousedown",handleClickOutside);
        return ()=>{
            document.removeEventListener("mousedown",handleClickOutside)
        }
    },[emojiRef])

    const handleSendMessage=async()=>{
      console.log(selectedChatType + "this is in handle Send message")
      
      if(selectedChatType==="contact"){
       
           socket.socket?.emit("sendMessage",{
            sender:userInfo?._id,
            content:message,
            recipient:selectedChatData._id,
            messageType:"text",
            fileUrl:undefined

           })
      }



    }
  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className='flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5'>
        <input type="text" className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"  placeholder='Enter Message' value={message} onChange={(e)=>setMessage(e.target.value)}/> 
        <button  className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duraion-300 transition-all'>
                            <GrAttachment className="text-2xl"/>
        </button>
        <div className="relative">
                    <button onClick={()=>setEmojiPickerOpen(true)} className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duraion-300 transition-all'>
                            <RiEmojiStickerLine className="text-2xl"/>
        </button>
        <div className='absolute bottom-16 right-0' ref={emojiRef}>
            <EmojiPicker theme={Theme.DARK} open={emojiPickerOpen} onEmojiClick={handleAddEmoji} autoFocusSearch={false}/>
        </div>
        </div>
      </div>
              <button onClick={handleSendMessage} className='bg-[#8417ff] rounded-md flex items-center p-5  justify-center hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duraion-300 transition-all'>
                            <IoSend className="text-2xl"/>
        </button>
    
    </div>
  )
}

export default MessageBar

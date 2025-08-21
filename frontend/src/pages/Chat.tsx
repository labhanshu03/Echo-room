// import React from 'react'
// import ContactsContainer from './chat/components/contacts-container/ContactsContainer'
// import EmptyChatContainer from './chat/components/empty-chat-container/EmptyChatContainer'
// import ChatContainer from './chat/components/chat-container/ChatContainer'

// function Chat() {
//   return (
//     <div className='flex h-[100vh] text-white overflow-hidden'>
//       <ContactsContainer/>
//       <EmptyChatContainer/>
//       <ChatContainer/>

//     </div>
//   )
// }

// export default Chat



import React from 'react'
import { useEffect } from 'react'
import {useNavigate} from "react-router-dom"
import {toast} from "sonner"
import ContactsContainer from "./chat/components/contacts-container/ContactsContainer.tsx"
import EmptyChatContainer from "./chat/components/empty-chat-container/EmptyChatContainer.tsx"
import ChatContainer from "./chat/components/chat-container/ChatContainer.tsx"
import { useChatStore, useUserStore } from '@/store/slices/auth-slice'

function Chat() {
  const {selectedChatType}=useChatStore()
  const {userInfo} =useUserStore()
  const navigate=useNavigate()
  useEffect(()=>{
    console.log(userInfo +"this is the chat ")
    if(!userInfo?.profileSetup){
      toast("Please setup profile to continue")
      navigate("/profile")
    }

  },[userInfo,navigate])
  return (
    <div className='flex h-[100vh] text-white overflow-hidden'>
     <ContactsContainer/>
     {selectedChatType===undefined ? <EmptyChatContainer/>:<ChatContainer/>
     }
    
     

    </div>
  )
}

export default Chat

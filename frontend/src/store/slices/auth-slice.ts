
import {create} from "zustand"




export interface userType{
    _id:string,
    email:string,
    password:string,
    firstName?:string,
    lastName?:string,
    image?:string,
    color?:number,
    profileSetup:Boolean,
    createdAt?:Date,
    updatedAt?:Date
}

export interface chatSlice{
    selectedChatType:undefined |string
    selectedChatData:any
    selectedChatMessage:any[],
    setSelectedChatType:(selectedChatType:string|undefined)=>void
    setSelectedChatData:(selectedChatData:any)=>void
    setSelectedChatMessages:(selectedChatMessage:any[])=>void
    closeChat:()=>void
     addMessage:(message:any)=>void
   
}


export const useChatStore=create<chatSlice>((set,get)=>({
   selectedChatType:undefined,
   selectedChatData:undefined,
   selectedChatMessage:[],
   setSelectedChatType:(selectedChatType)=>set({selectedChatType}),
   setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
     setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessage: selectedChatMessages }),
    addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessage;
    const selectedChatType = get().selectedChatType;
    
    set({
      selectedChatMessage: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "channel"
              ? message.sender
              : message.sender._id,
        }
      ],
    });
   },
     closeChat: () =>
    set({
      selectedChatType: undefined,
      selectedChatData: undefined,
      selectedChatMessage: [],
    }),
    

}))


export interface AuthSlice{
    userInfo:userType|undefined
    setUserInfo:(userInfo:userType|undefined)=>void
}

export const useUserStore=create<AuthSlice>((set)=>({
    userInfo: undefined,
    setUserInfo:(userInfo:userType|undefined)=>set(()=>({userInfo}))
   
}))

  






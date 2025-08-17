
import {create} from "zustand"




interface userType{
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



export interface AuthSlice{
    userInfo:userType|undefined
    setUserInfo:(userInfo:userType|undefined)=>void
}

export const useUserStore=create<AuthSlice>((set)=>({
    userInfo: undefined,
    setUserInfo:(userInfo:userType|undefined)=>set(()=>({userInfo}))
   
}))







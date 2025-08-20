import React, { useContext, useEffect, useState } from 'react'
import { Button } from './components/ui/button'
import {  Routes ,Route, Navigate} from 'react-router-dom'
import Auth from './pages/Auth'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import { useUserStore } from './store/slices/auth-slice'
import axios from 'axios'
import { authDataContext } from './context/AuthContext'


function App() { 

   const {serverUrl}=useContext(authDataContext)!
   const {userInfo,setUserInfo}=useUserStore()
   const [loading,setLoading]=useState(true)

   useEffect(()=>{
    
    
    const getUserData=async()=>{
       console.log("dfaadfs")
      try{
        
          const response=await axios.get(`${serverUrl}/api/auth/userinfo`,{withCredentials:true})
        console.log("thisis the response"+response.data +"fsda")
        console.log(response.data)
        if(response.status==200 && response.data._id){
          console.log(response.data)
          setUserInfo(response.data)
        }else{
          setUserInfo(undefined)
        }
      }catch(error){
        console.log(error)
        setUserInfo(undefined)
      }finally{
        setLoading(false)
      }
    }

     if(!userInfo){
        getUserData()
   }else{
    setLoading(false)
   }
   },[userInfo,setUserInfo])

  

  return (
  <Routes>
   <Route path="/auth" element={<Auth/>}/>
   <Route path="/chat" element={<Chat/>}></Route>
   <Route path="/profile" element={<Profile/>}></Route>

   <Route path="*" element={<Navigate to="/auth"/>}/>
         
   
  </Routes>
  )
}

export default App

import React from 'react'
import { Button } from './components/ui/button'
import {  Routes ,Route, Navigate} from 'react-router-dom'
import Auth from './pages/Auth'
import Chat from './pages/Chat'
import Profile from './pages/Profile'


function App() {
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

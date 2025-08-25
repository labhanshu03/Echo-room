import { useChatStore, useUserStore } from '@/store/slices/auth-slice'
import React, { useContext, useEffect, useState } from 'react'
import moment from "moment"
import { Divide } from 'lucide-react'
import { useRef } from 'react'
import axios from 'axios'
import { authDataContext } from '@/context/AuthContext'
import  {MdFolderZip} from "react-icons/md"
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from 'react-icons/io5'

function MessageContainer() {

  const scrollRef:any=useRef(null)
   const {selectedChatType,selectedChatData,setFileDownloadProgress,setIsDownloading,selectedChatMessage,setSelectedChatMessages}=useChatStore()
    const {userInfo}=useUserStore()
    const {serverUrl}=useContext(authDataContext)!
    const [showImage,setShowImage]=useState(false)
    const [imageUrl,setImageUrl]=useState<string|null>(null)

  const downloadFile=async(url:any)=>{
    setIsDownloading(true)
    setFileDownloadProgress(0)

         const response =await axios.get(`${serverUrl}/${url.replace("public","")}`,{responseType:"blob",onDownloadProgress:(ProgressEvent)=>{
          const {loaded,total}=ProgressEvent;
          const percentCompleted=Math.round((loaded*100)/(total?total:100))
          setFileDownloadProgress(percentCompleted)

         }})
         const urlBlob=window.URL.createObjectURL(new Blob([response.data]))
         const link =document.createElement("a")
         link.href=urlBlob
         link.setAttribute("download",url.split("/").pop())
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(urlBlob)
          setIsDownloading(false)
          setFileDownloadProgress(0)
          
  }


  const renderMessages=()=>{
    let lastDate:any=null;
    return selectedChatMessage.map((message,ind)=>{
      const messageDate=moment(message.timestamp).format("YYYY-MM-DD");
      const showDate=messageDate!==lastDate
      lastDate=messageDate;
      return <div key={ind}>
        {showDate && <div className='text-center text-gray-500 my-2'>
          {moment(message.timestamp).format("LL")}
           </div>
          }
          {
            selectedChatType==="contact" && renderDMMessages(message)
          }
      </div>
    })
  }

  const checkIfImage=(filePath:string)=>{
    const imageRegex=/\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath)
  }



    const renderDMMessages=(message:any)=> <div className={`${message.sender===selectedChatData._id?"text-left":"text-right"}`}>   
    {message.messageType==="text" &&
      <div className={`${message.sender!==selectedChatData._id?"bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50 ":"bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
      {message.content}
    </div>
}
{
  message.messageType==="file" && <div className={`${message.sender!==selectedChatData._id?"bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50 ":"bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
     {
      checkIfImage(message.fileUrl)?<div className="cursor-pointer" onClick={()=>{setShowImage(true);setImageUrl(message.fileUrl)}}>
       
        <img src={`${serverUrl}/${message.fileUrl.replace('public', '')}`}  alt="" className='h-[300px] w-[300px]' />
      </div>:<div className='flex items-center justify-center gap-4'>
        <span className='text-white/8 text-3xl bg-black/20 rounded-full p-3'>
        <MdFolderZip/>
        </span>
        <span>{message.fileUrl.split("-").pop()}</span>
        <span onClick={()=>downloadFile(message.fileUrl)} className=' bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'>
          <IoMdArrowRoundDown/>
        </span>
        
      </div>
     }
    </div>
}
<div className='text-xs text-grap-600'>
  {moment(message.timestamp).format("LT")}
</div>
    </div>

    useEffect(()=>{
      const getMessages=async()=>{
        try{
          const response=await axios.post(`${serverUrl}/api/messages/get-messages`,{id:selectedChatData._id},{withCredentials:true})
          if(response.data.messages){
            setSelectedChatMessages(response.data.messages)
          }

        }catch(error){
          console.log(error)
        }

      }
      if(selectedChatData._id){
        if(selectedChatType==="contact") getMessages()
      }
    },[selectedChatData,selectedChatType])

  
  useEffect(()=>{
if(scrollRef.current){
  scrollRef.current.scrollIntoView({ behavior:"smooth"});
}
  },[selectedChatMessage])
  return (
    <div className='flex-1 overflow-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full '>
      {renderMessages()}
      <div ref={scrollRef}></div>
      {
        showImage && <div className='fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg'>
          <div>
            <img src={`${serverUrl}/${imageUrl?.replace('public', '')}`} alt="" className='h-[80vh] w-full bg-cover ' />
          </div>
          <div className='flex gap-5 fixed top-0 mt-5'>
            <button  onClick={()=>downloadFile(imageUrl)} className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'>
            <IoMdArrowRoundDown/>
            </button>
            <button  onClick={()=>{setShowImage(false);setImageUrl(null)}} className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'>
            <IoCloseSharp/>
            </button>

          </div>

        </div>
      }
    </div>
  )
}

export default MessageContainer

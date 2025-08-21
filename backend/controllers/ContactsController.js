import mongoose from "mongoose"
import User from "../models/UserModel.js"

export const searchContacts=async(req,res,next)=>{

    try{
        const {searchTerm}=req.body
  

        if(searchTerm===undefined || searchTerm==null){
          return res.status(400).json({message:"search term is required"})
        }
        const sanitizedSearchTerm=searchTerm.replace(/[.*+?${}()|[\]\\]/g,"\\$&")
        const regex=new RegExp(sanitizedSearchTerm,"i")
       
        
         
        const contacts=await User.find({
          $and:[
            {_id:{$ne:new mongoose.Types.ObjectId(req.userId)}},  
            {
              $or:[{firstName:regex} ,{lastName:regex} ,{email:regex} ]
            }
          ]
        })
    
        return res.status(200).json({contacts})


     

    }catch(error){
      console.log(error)
          return res.status(500).json({message:"interal server errro"})
    }
}
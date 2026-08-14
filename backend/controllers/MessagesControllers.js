import { response } from "express"
import Message from "../models/MessageModel.js"
import axios from "axios"
import { createInternalToken } from "../utils/internalAuth.js"
import { getDmConversationKey, getChannelConversationKey } from "../utils/conversationKey.js"

export const getMessages=async(req,res,next)=>{
    try{
        const user1=req.userId
        const user2=req.body.id

        if(!user1|| !user2){
            return res.status(400).send("both userIds are required")

        }

        const messages=await Message.find({
            $or:[
                {sender:user1,recipient:user2},{sender:user2,recipient:user1}
            ],
        }).sort({timestamp:1})
        return res.status(200).json({messages})
    }catch(error){
             console.log({error})
             return res.status(500).send("Internal server error")
    }
}


export const  uploadFile=async(req,res,next)=>{
    try{

        if(!req.file){
            return response.status(400).send("file is requrired")
        }

   

         return res.status(200).json(req.file.path)
         
    }catch(error){
        console.log(error)
    }

}

export const askQuestion = async (req, res) => {
    try {
        const userId = req.userId
        const { question, recipientId, channelId } = req.body

        if (!question) {
            return res.status(400).send("question is required")
        }

        let conversationKey
        if (channelId) {
            conversationKey = getChannelConversationKey(channelId)
        } else if (recipientId) {
            conversationKey = getDmConversationKey(userId, recipientId)
        } else {
            return res.status(400).send("recipientId or channelId is required")
        }

        const internalToken = createInternalToken(userId)

        const ragResponse = await axios.post(`${process.env.RAG_SERVICE_URL}/query`, {
            question,
            internalToken,
            conversationKey
        })

        return res.status(200).json(ragResponse.data)
    } catch (error) {
        if (error.response) {
            console.log(error.response.data)
            return res.status(502).send("RAG service error")
        }
        console.log(error)
        return res.status(500).send("Internal server error")
    }
}
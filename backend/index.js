import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connect } from "mongoose"
import { connectDb } from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import contactsRoutes from "./routes/contactRoutes.js"
import setupSocket from "./socket.js"

dotenv.config()


const app=express()
const port=process.env.PORT ||5000
app.use(cookieParser())
app.use(express.json()) 

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
      
}))


app.use("/api/auth",authRoutes)
app.use("/api/contacts",contactsRoutes)

const server=app.listen(port,()=>{
    connectDb()
      
     console.log("server started at port" + port)
})



setupSocket(server)
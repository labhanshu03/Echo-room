import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connect } from "mongoose"
import { connectDb } from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"

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

app.listen(port,()=>{
    connectDb()
      
     console.log("server started at port" + port)
})


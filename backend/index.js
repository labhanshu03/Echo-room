import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connect } from "mongoose"
import { connectDb } from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import contactsRoutes from "./routes/contactRoutes.js"
import setupSocket from "./socket.js"
import { messagesRoutes } from "./routes/MessagesRoutes.js"
import channelRoutes from "./routes/ChannelRoutes.js"
import { httpMetricsMiddleware, register } from "./middlewares/metrics.js"


const app=express()
const port=process.env.PORT ||5000
app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin:["https://echo-room-frontend1.onrender.com","http://localhost:5173", "http://localhost:5174"],
    credentials:true,

}))

app.use(httpMetricsMiddleware)

app.use(express.static("public"))




app.use("/api/auth",authRoutes)
app.use("/api/contacts",contactsRoutes)
app.use("/api/messages",messagesRoutes)
app.use("/api/channel",channelRoutes)


app.get("/",(req,res)=>{
      res.json({ message: 'Server is running!' });
})

// Prometheus scrapes this endpoint. It's plain text, not JSON.
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
})
const server=app.listen(port,()=>{
    connectDb()
      
     console.log("server started at port" + port)
})

setupSocket(server)

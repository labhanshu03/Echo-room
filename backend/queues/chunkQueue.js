import { Queue } from "bullmq"
import redisConnection from "../config/redisConnection.js"

export const chunkQueue = new Queue("chunk-processing", {
    connection: redisConnection
})

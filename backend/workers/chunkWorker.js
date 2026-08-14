  import { Worker } from "bullmq"
  import redisConnection from
  "../config/redisConnection.js"
  import axios from "axios"

  const worker = new Worker(
      "chunk-processing",
      async (job) => {
          console.log(`Processing job ${job.id} for
  chunk ${job.data.chunkId}`)
          // real logic (calling the Python service)
             await axios.post(`${process.env.RAG_SERVICE_URL}/process-chunk`, {
              chunkId: job.data.chunkId
          })

          console.log(`Chunk ${job.data.chunkId} sent to RAG service`)
  
      },
      { connection: redisConnection }
  )

  worker.on("completed", (job) => {
      console.log(`Job ${job.id} completed`)
  })

  worker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed:
  ${err.message}`)
  })

  console.log("Chunk worker started, waiting forjobs...")
  import Chunk from "../models/ChunkMode.js"
  import { chunkQueue } from "../queues/chunkQueue.js"

  const CHUNK_CLOSE_DELAY_MS = process.env.CHUNK_CLOSE_DELAY_MS_OVERRIDE
    ? parseInt(process.env.CHUNK_CLOSE_DELAY_MS_OVERRIDE)
    : 10 * 60 * 1000
  const MAX_MESSAGES_PER_CHUNK = 15

  export async function appendMessageToChunk({ message, participants, conversationKey }) {
      const entry = {
          messageId: message._id,
          senderId: message.sender,
          text: message.content,
          timestamp: message.timeStamp
      }

      let chunk = await Chunk.findOne({ conversationKey, status: "open" })

      if (chunk && chunk.entries.length >= MAX_MESSAGES_PER_CHUNK) {
          await finalizeChunkNow(chunk._id)
          chunk = null
      }

      if (!chunk) {
          chunk = await Chunk.create({
              entries: [entry],
              participants,
              conversationKey,
              status: "open"
          })
      } else {
          chunk.entries.push(entry)
          await chunk.save()
      }

      await rescheduleFinalizeJob(chunk._id)

      return chunk
  }

  async function rescheduleFinalizeJob(chunkId) {
      const jobId = chunkId.toString()
      const existingJob = await chunkQueue.getJob(jobId)
      if (existingJob) {
          await existingJob.remove()
      }
      await chunkQueue.add(
          "finalize-chunk",
          { chunkId: jobId },
          { delay: CHUNK_CLOSE_DELAY_MS, jobId }
      )
  }

  async function finalizeChunkNow(chunkId) {
      const jobId = chunkId.toString()
      const existingJob = await chunkQueue.getJob(jobId)
      if (existingJob) {
          await existingJob.remove()
      }
      await chunkQueue.add("finalize-chunk", { chunkId: jobId })
  }

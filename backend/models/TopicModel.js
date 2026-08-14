import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
     summary: { 
        type: String, 
        required: true
     }, 
      centroidEmbedding: {
          type: [Number],
          required: true
      },
      participants: [
          {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Users",
              required: true
          }
      ],
      chunkRefs: [
          {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Chunks",
              required: true
          }
      ],
      lastUpdated: {
          type: Date,
          default: Date.now
      }
  }, { timestamps: { createdAt: true, updatedAt: false } })


const Topic = mongoose.model("Topics", topicSchema)

export default Topic
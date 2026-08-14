import mongoose from "mongoose"

const entrySchema = new mongoose.Schema({
    messageId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Messages",
        required: true
    }, 
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required:true
    },
    text: {
          type: String,
          required: true
      },
    timestamp: {
          type: Date,
          required: true
      }
    
},{_id: false})



const chunkSchema = new mongoose.Schema({
      entries: {
          type: [entrySchema],
          required: true
      },
      embeddingText: {
          type: String,
          default: null
      },
      embedding: {
          type: [Number],
          default: null
      },
      participants: [
          {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Users",
              required: true
          }
      ],
      conversationKey: {
          type: String,
          required: true
      },
      topicId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topics",
          default: null
      },
      status: {
          type: String,
          enum: ["open", "closed"],
          default: "open"
      }
  }, { timestamps: true })

const chunk = mongoose.model("Chunks", chunkSchema)

export default chunk
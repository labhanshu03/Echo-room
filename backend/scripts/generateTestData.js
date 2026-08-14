import "dotenv/config"
import mongoose from "mongoose"
import Message from "../models/MessageModel.js"
import { appendMessageToChunk } from "../services/chunkService.js"
import { getDmConversationKey } from "../utils/conversationKey.js"

const LABHANSHU = "694ccd8455d03db1c6f967f5"
const UMANG = "69707c12981aec14c07d4771"
const SHUBHANSHU = "69526cf86596c8607b82f2f9"
const DHRUV = "69908caeec06dea68eed8213"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const conversations = [
    {
        participants: [LABHANSHU, UMANG],
        messages: [
            [LABHANSHU, "should we buy groceries today?"],
            [UMANG, "yeah lets get milk and eggs"],
            [LABHANSHU, "and don't forget bread"]
        ]
    },
    {
        participants: [LABHANSHU, UMANG],
        messages: [
            [LABHANSHU, "wanna watch a movie this weekend?"],
            [UMANG, "sure what are you thinking"],
            [LABHANSHU, "maybe the new sci-fi one that just released"],
            [UMANG, "saturday evening works for me"]
        ]
    },
    {
        participants: [LABHANSHU, UMANG],
        messages: [
            [LABHANSHU, "are you free for gym tomorrow morning?"],
            [UMANG, "yeah lets go at 7am"],
            [LABHANSHU, "should we do legs day?"]
        ]
    },
    {
        // deliberately mixed subjects — tests the segmentation pass
        participants: [LABHANSHU, UMANG],
        messages: [
            [LABHANSHU, "lets order pizza tonight"],
            [UMANG, "sure, pepperoni?"],
            [LABHANSHU, "by the way did you watch the cricket match yesterday"],
            [UMANG, "yeah india won it was great"],
            [LABHANSHU, "also remind me to call the dentist tomorrow"]
        ]
    },
    {
        participants: [LABHANSHU, SHUBHANSHU],
        messages: [
            [LABHANSHU, "read any good books lately?"],
            [SHUBHANSHU, "yeah i finished a great mystery novel"],
            [LABHANSHU, "what's it called"],
            [SHUBHANSHU, "the silent patient, you should read it"]
        ]
    },
    {
        participants: [LABHANSHU, SHUBHANSHU],
        messages: [
            [LABHANSHU, "my car needs servicing soon"],
            [SHUBHANSHU, "which one"],
            [LABHANSHU, "the honda, brakes are making noise"],
            [SHUBHANSHU, "book an appointment this week"]
        ]
    },
    {
        participants: [LABHANSHU, SHUBHANSHU],
        messages: [
            [LABHANSHU, "how's exam prep going"],
            [SHUBHANSHU, "not great, gotta study calculus"],
            [LABHANSHU, "want to study together saturday"],
            [SHUBHANSHU, "yeah lets do library at 10am"]
        ]
    },
    {
        participants: [LABHANSHU, DHRUV],
        messages: [
            [LABHANSHU, "what should we get sarah for her birthday"],
            [DHRUV, "maybe a book or a gift card"],
            [LABHANSHU, "lets go with a gift card, easier"],
            [DHRUV, "ill order it today"]
        ]
    },
    {
        participants: [LABHANSHU, DHRUV],
        messages: [
            [LABHANSHU, "are you still using that netflix account"],
            [DHRUV, "not really, we should cancel it"],
            [LABHANSHU, "ill cancel it this weekend"]
        ]
    },
    {
        participants: [LABHANSHU, DHRUV],
        messages: [
            [LABHANSHU, "want to go hiking this weekend"],
            [DHRUV, "yeah which trail"],
            [LABHANSHU, "maybe the ridge trail, its not too hard"],
            [DHRUV, "sounds good, saturday morning"]
        ]
    },
    {
        // continuation test — should ideally merge back into the pizza sub-topic
        // created above, despite several unrelated bursts happening in between
        participants: [LABHANSHU, UMANG],
        messages: [
            [LABHANSHU, "did we ever end up ordering that pizza?"],
            [UMANG, "oh yeah we did, it was really good"]
        ]
    }
]

async function run() {
    await mongoose.connect(process.env.DATABASE_URL)
    console.log("connected to mongo")

    for (const [index, convo] of conversations.entries()) {
        const conversationKey = getDmConversationKey(convo.participants[0], convo.participants[1])
        console.log(`\n=== conversation ${index + 1}/${conversations.length} (${conversationKey}) ===`)

        for (const [sender, text] of convo.messages) {
            const recipient = convo.participants.find((p) => p !== sender)
            const message = await Message.create({
                sender,
                recipient,
                content: text,
                messageType: "text"
            })
            await appendMessageToChunk({
                message,
                participants: convo.participants,
                conversationKey
            })
            console.log(`  sent: ${text}`)
            await sleep(400)
        }

        console.log("  waiting for chunk to close and process...")
        await sleep(35000)
    }

    console.log("\ndone generating test data")
    process.exit(0)
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})

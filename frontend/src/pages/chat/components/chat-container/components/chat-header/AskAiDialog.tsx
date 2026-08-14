import { useContext, useState } from "react"
import axios from "axios"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RiSparklingLine } from "react-icons/ri"
import { authDataContext } from "@/context/AuthContext"

interface AskAiDialogProps {
  selectedChatType: string | undefined
  selectedChatData: any
}

function AskAiDialog({ selectedChatType, selectedChatData }: AskAiDialogProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { serverUrl } = useContext(authDataContext)!

  const handleAsk = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    setError("")
    setAnswer("")

    try {
      const response = await axios.post(
        `${serverUrl}/api/messages/ask`,
        {
          question,
          recipientId: selectedChatType === "contact" ? selectedChatData._id : undefined,
          channelId: selectedChatType === "channel" ? selectedChatData._id : undefined,
        },
        { withCredentials: true }
      )
      setAnswer(response.data.answer)
    } catch (err) {
      setError("Something went wrong while getting an answer. Please try again.")
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        setQuestion("")
        setAnswer("")
        setError("")
      }
    }}>
      <DialogTrigger asChild>
        <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all">
          <RiSparklingLine className="text-3xl" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1c1d25] text-white border-[#2f303b]">
        <DialogHeader>
          <DialogTitle>Ask about this conversation</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk()
              }}
              placeholder="What did we decide about..."
              className="bg-[#2a2b33] border-none text-white"
            />
            <button
              onClick={handleAsk}
              disabled={isLoading}
              className="bg-[#8417ff] rounded-md px-4 py-2 hover:bg-[#741bda] disabled:opacity-50 transition-all"
            >
              {isLoading ? "Asking..." : "Ask"}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {answer && (
            <div className="bg-[#2a2b33] rounded-md p-4 text-sm text-neutral-200 whitespace-pre-wrap">
              {answer}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AskAiDialog

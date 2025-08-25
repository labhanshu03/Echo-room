import React, { useContext, useState } from "react";
import { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Contact, Divide } from "lucide-react";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import Lottie from "react-lottie";
import axios from "axios";
import { authDataContext } from "@/context/AuthContext";

import { useChatStore, useUserStore, type userType } from "@/store/slices/auth-slice";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

function CREATECHANNEL() { 
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const { serverUrl } = useContext(authDataContext)!;
  const { userInfo } = useUserStore();
  const {setSelectedChatType,setSelectedChatData,selectedChatType}=useChatStore()
  


  const selectNewContact = (contact: userType) => {
    setOpenNewContactModal(false)
    setSelectedChatType("contact")
   
    setSelectedChatData(contact)
    setSearchedContacts([])


  };

  const searchContacts = async (searchTerm: string) => {
    console.log(searchTerm)
    try {
      if (searchTerm.length > 0) {
        const response = await axios.post(
          `${serverUrl}/api/contacts/search`,
          { searchTerm },
          { withCredentials: true }
        );
        console.log(response.data)
        if (response.status == 200 && response.data.contacts) {
          setSearchedContacts(response.data.contacts);
        }
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.log(error);
    }
  };




  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              onClick={() => setOpenNewContactModal(true)}
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300 "
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            {" "}
            Select New Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please select a contact</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <input
              type="text"
              placeholder="Search Contacts"
              className="rounded-lg p-6 bg-[#2c2e3b]  w-full border-black"
              onChange={(e) => searchContacts(e.target.value)}
            />
          </div>
    
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CREATECHANNEL


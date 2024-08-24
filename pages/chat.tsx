import { prisma } from "@/utils/db";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import Link from "next/link";

type Message = {
  id: string;
  content: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
};

const Chat = ({ initialMessages }: { initialMessages: Message[] }) => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    if (res.ok) {
      const newMessage = await res.json();
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-scroll p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col space-y-2">
            <div className="self-start max-w-xs p-3 bg-blue-500 text-white rounded-lg">
              <p>{msg.content}</p>
            </div>
            {msg.reply && (
              <div className="self-end max-w-xs p-3 bg-green-500 text-white rounded-lg">
                <p>{msg.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 bg-white flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
      <button>
        <Link href={"/admin"}>Dashboard</Link>
      </button>
    </div>
  );
};

export async function getServerSideProps({ req, res }: { req: any; res: any }) {
  const session = await getServerSession(req, res, authOptions);

  const messages = await prisma.message.findMany({
    where: { userId: session?.user.id },
    orderBy: { createdAt: "asc" },
  });

  const serializedMessages = messages.map((message) => ({
    ...message,
    createdAt: message.createdAt.toISOString(),
  }));

  return {
    props: { initialMessages: serializedMessages },
  };
}

export default Chat;

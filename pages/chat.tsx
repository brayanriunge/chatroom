// import { prisma } from "@/utils/db";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";
// import { authOptions } from "./api/auth/[...nextauth]";
// import { getServerSession } from "next-auth";
// import Link from "next/link";

// type Message = {
//   id: string;
//   content: string;
//   reply?: string;
//   createdAt: string;
//   updatedAt: string;
// };

// const Chat = ({ initialMessages }: { initialMessages: Message[] }) => {
//   const { data: session } = useSession();
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState(initialMessages);

//   // useEffect(() => {
//   //   const intervalId = setInterval(async () => {
//   //     const res = await fetch("http://localhost:3000/api/getMesages", {
//   //       method: "GET",
//   //     });
//   //     if (res.ok) {
//   //       const updatedMessages: Message[] = await res.json();
//   //       setMessages(updatedMessages);
//   //     }
//   //   }, 5000); // Poll every 5 seconds

//   //   return () => clearInterval(intervalId);
//   // }, []);

//   const sendMessage = async () => {
//     if (message.trim() === "") return;

//     const res = await fetch("http://localhost:3000/api/messages", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ content: message }),
//     });

//     if (res.ok) {
//       const newMessage = await res.json();
//       setMessages((prevMessages) => [...prevMessages, newMessage]);
//       setMessage("");
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       <div className="flex-1 overflow-y-scroll p-4 space-y-4 bg-gray-50">
//         {messages.map((msg) => (
//           <div key={msg.id} className="flex flex-col space-y-2">
//             <div className="self-start max-w-xs p-3 bg-blue-500 text-white rounded-lg">
//               <p>{msg.content}</p>
//             </div>
//             {msg.reply && (
//               <div className="self-end max-w-xs p-3 bg-green-500 text-white rounded-lg">
//                 <p>{msg.reply}</p>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//       <div className="p-4 bg-white flex">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type your message"
//           className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none"
//         />
//         <button
//           onClick={sendMessage}
//           className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
//         >
//           Send
//         </button>
//       </div>
//       <button>
//         <Link href={"/admin"}>Dashboard</Link>
//       </button>
//     </div>
//   );
// };

// export async function getServerSideProps({ req, res }: { req: any; res: any }) {
//   const session = await getServerSession(req, res, authOptions);

//   const messages = await prisma.message.findMany({
//     where: { userId: session?.user.id },
//     orderBy: { createdAt: "asc" },
//   });

//   const serializedMessages = messages.map((message) => ({
//     ...message,
//     createdAt: message.createdAt.toISOString(),
//   }));

//   return {
//     props: { initialMessages: serializedMessages },
//   };
// }

// export default Chat;

import { prisma } from "@/utils/db";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import Link from "next/link";

type Message = {
  id: string;
  content: string;
  Reply: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      name: string;
    };
  }[];
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
        {/* {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col space-y-2">
            <div className="self-start max-w-xs p-3 bg-blue-500 text-white rounded-lg">
              <p>{msg.content}</p>
            </div>
            {msg.Reply.map((reply) => (
              <div
                key={reply.id}
                className="self-end max-w-xs p-3 bg-green-500 text-white rounded-lg"
              >
                <p>{reply.content}</p>
              </div>
            ))}
          </div>
        ))} */}
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col space-y-2">
            <div className="self-start max-w-xs p-3 bg-blue-500 text-white rounded-lg">
              <p>{msg.content}</p>
              <p className="text-xs text-gray-200 text-right">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
            {Array.isArray(msg.Reply) && msg.Reply.length > 0 && (
              <div className="self-end max-w-xs">
                {msg.Reply.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-3 bg-green-500 text-white rounded-lg mt-2"
                  >
                    <p>{reply.content}</p>
                    <p className="text-xs text-gray-200 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString()} hey
                    </p>
                  </div>
                ))}
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
        <Link href="/admin">Dashboard</Link>
      </button>
    </div>
  );
};

export async function getServerSideProps({ req, res }: { req: any; res: any }) {
  const session = await getServerSession(req, res, authOptions);

  const messages = await prisma.message.findMany({
    where: { userId: session?.user.id },
    include: {
      Reply: {
        include: {
          user: true, // Include the user who sent the reply
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const serializedMessages = messages.map((message) => ({
    ...message,
    createdAt: message.createdAt.toISOString(),

    Reply: message.Reply.map((reply) => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      user: {
        ...reply.user,
        createdAt: reply.user.createdAt.toISOString(),
        updatedAt: reply.user.updatedAt.toISOString(),
      },
    })),
  }));

  return {
    props: { initialMessages: serializedMessages },
  };
}

export default Chat;

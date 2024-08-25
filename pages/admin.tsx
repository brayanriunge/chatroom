// import { prisma } from "@/utils/db";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";

// type Message = {
//   id: string;
//   content: string;
//   reply: string | null;
//   user: {
//     name: string;
//   };
// };

// const AdminDashboard = ({ messages }: { messages: Message[] }) => {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [replies, setReplies] = useState<{ [key: string]: string }>({});
//   useEffect(() => {
//     if (status === "authenticated" && session?.user.role !== "ADMIN") {
//       router.push("/");
//     }
//   }, [session, status, router]);

//   if (
//     status === "loading" ||
//     (status === "authenticated" && session?.user.role !== "ADMIN")
//   ) {
//     return <div>Loading...</div>;
//   }

//   if (session?.user.role !== "ADMIN") {
//     router.push("/");
//     return null;
//   }

//   const handleReplyChange = (id: string, value: string) => {
//     setReplies({ ...replies, [id]: value });
//   };

//   const handleReplySubmit = async (id: string) => {
//     await fetch(`http://localhost:3000/api/reply`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ id, reply: replies[id] }),
//     });
//     router.reload();
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
//       <div className="space-y-4">
//         {messages.map((message) => (
//           <div key={message.id} className="p-4 bg-gray-100 rounded">
//             <p>{message.content}</p>
//             <p>From: {message.user.name}</p>
//             {message.reply && (
//               <p className="text-green-600 mt-2">Reply: {message.reply}</p>
//             )}
//             <textarea
//               value={replies[message.id] || ""}
//               onChange={(e) => handleReplyChange(message.id, e.target.value)}
//               className="border p-2 w-full mt-2"
//               placeholder="Type your reply here..."
//             />
//             <button
//               onClick={() => handleReplySubmit(message.id)}
//               className="bg-blue-500 text-white p-2 rounded mt-2"
//             >
//               Send Reply
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export async function getServerSideProps() {
//   const messages = await prisma.message.findMany({
//     include: {
//       user: true,
//     },
//   });

//   const serializedMessages = messages.map((message) => ({
//     ...message,
//     createdAt: message.createdAt.toISOString(),

//     user: {
//       ...message.user,
//       createdAt: message.user.createdAt.toISOString(),
//       updatedAt: message.user.updatedAt.toISOString(),
//     },
//   }));

//   return {
//     props: { messages: serializedMessages },
//   };
// }

// export default AdminDashboard;

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { prisma } from "@/utils/db";
import { User } from "next-auth";

// type User = {
//   id: string;
//   name: string;
// };

type Message = {
  id: string;
  content: string;
  reply?: string;
  createdAt: string;
  user: User;
};

const AdminDashboard = ({
  users,
  initialMessages,
}: {
  users: User[];
  initialMessages: Message[];
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (session?.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, router]);

  const handleSelectUser = async (userId: string) => {
    setSelectedUserId(userId);
    const res = await fetch(
      `http://localhost:3000/api/messages?userId=${userId}`
    );
    if (res.ok) {
      const userMessages: Message[] = await res.json();
      setMessages(userMessages);
    }
  };

  const handleReply = async (messageId: string) => {
    const res = await fetch("http://localhost:3000/api/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, reply }),
    });
    if (res.ok) {
      const updatedMessage = await res.json();
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
      setReply("");
    }
  };

  return (
    <div className="flex h-screen">
      {/* User List */}
      <div className="w-1/4 p-4 bg-gray-100">
        <h2 className="text-lg font-bold mb-4">Users</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className={`p-2 cursor-pointer ${
                selectedUserId === user.id
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              } rounded-lg`}
              onClick={() => handleSelectUser(user.id)}
            >
              {user.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Conversation View */}
      <div className="flex-1 flex flex-col p-4">
        {selectedUserId ? (
          <>
            <h2 className="text-lg font-bold mb-4">
              Conversation with{" "}
              {users.find((user) => user.id === selectedUserId)?.name}
            </h2>
            <div className="flex-1 overflow-y-scroll space-y-4 bg-gray-50 p-4 rounded-lg">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col space-y-2">
                  <div className="self-start max-w-xs p-3 bg-gray-200 rounded-lg">
                    <p className="font-bold">{msg.user.name}</p>
                    <p>{msg.content}</p>
                  </div>
                  {msg.reply && (
                    <div className="self-end max-w-xs p-3 bg-green-500 text-white rounded-lg">
                      <p>Admin: {msg.reply}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type your reply"
                      className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={() => handleReply(msg.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Select a user to view their messages</p>
        )}
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const initialMessages =
    users.length > 0
      ? await prisma.message.findMany({
          where: { userId: users[0].id },
          include: { user: true },
          orderBy: { createdAt: "asc" },
        })
      : [];

  const serializedMessages = initialMessages.map((message) => ({
    ...message,
    createdAt: message.createdAt.toISOString(),

    user: {
      ...message.user,
      createdAt: message.user.createdAt?.toISOString(),
      updatedAt: message.user.updatedAt?.toISOString(),
    },
  }));

  return {
    props: {
      users,
      initialMessages: serializedMessages,
    },
  };
}

export default AdminDashboard;

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { User } from "next-auth";

type Message = {
  id: string;
  content: string;
  reply: string | null;
  user: {
    name: string;
  };
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
  const [replies, setReplies] = useState<Record<string, string>>({});

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

  const handleReplySubmit = async (id: string) => {
    const res = await fetch(`http://localhost:3000/api/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, reply: replies[id] }),
    });
    if (res.ok) {
      const updatedMessage = await res.json();
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
      setReplies((prev) => ({ ...prev, [id]: "" }));
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
                      value={replies[msg.id] || ""}
                      onChange={(e) =>
                        setReplies({ ...replies, [msg.id]: e.target.value })
                      }
                      placeholder="Type your reply"
                      className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={() => handleReplySubmit(msg.id)}
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

export default AdminDashboard;

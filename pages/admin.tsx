import { prisma } from "@/utils/db";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Message = {
  id: string;
  content: string;
  reply: string | null;
  user: {
    name: string;
  };
};

const AdminDashboard = ({ messages }: { messages: Message[] }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [replies, setReplies] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  if (
    status === "loading" ||
    (status === "authenticated" && session?.user.role !== "ADMIN")
  ) {
    return <div>Loading...</div>;
  }

  if (session?.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  const handleReplyChange = (id: string, value: string) => {
    setReplies({ ...replies, [id]: value });
  };

  const handleReplySubmit = async (id: string) => {
    await fetch(`http://localhost:3000/api/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, reply: replies[id] }),
    });
    router.reload();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="p-4 bg-gray-100 rounded">
            <p>{message.content}</p>
            <p>From: {message.user.name}</p>
            {message.reply && (
              <p className="text-green-600 mt-2">Reply: {message.reply}</p>
            )}
            <textarea
              value={replies[message.id] || ""}
              onChange={(e) => handleReplyChange(message.id, e.target.value)}
              className="border p-2 w-full mt-2"
              placeholder="Type your reply here..."
            />
            <button
              onClick={() => handleReplySubmit(message.id)}
              className="bg-blue-500 text-white p-2 rounded mt-2"
            >
              Send Reply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  const messages = await prisma.message.findMany({
    include: {
      user: true,
    },
  });

  const serializedMessages = messages.map((message) => ({
    ...message,
    createdAt: message.createdAt.toISOString(),

    user: {
      ...message.user,
      createdAt: message.user.createdAt.toISOString(),
      updatedAt: message.user.updatedAt.toISOString(),
    },
  }));

  return {
    props: { messages: serializedMessages },
  };
}

export default AdminDashboard;

import { prisma } from "@/utils/db";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

type Message = {
  id: string;
  content: string;
  user: {
    name: string;
  };
};

const AdminDashboard = ({ messages }: { messages: Message[] }) => {
  const { data: session } = useSession();
  const router = useRouter();

  if (session?.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="p-4 bg-gray-100 rounded">
            <p>{message.content}</p>
            <p>From: {message.user.name}</p>
            {/* Add form to reply to the message */}
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

  // Convert Date objects to strings
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

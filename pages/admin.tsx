import { prisma } from "@/utils/db";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const AdminDashboard = ({ messages }: { messages: string[] }) => {
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

  return {
    props: { messages },
  };
}

export default AdminDashboard;

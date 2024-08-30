// pages/api/messages.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const session = await getSession({ req });
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = session.user.id;
      const messages = await prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });

      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

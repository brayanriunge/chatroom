import { prisma } from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { content } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    const message = await prisma.message.create({
      data: {
        content,
        userId: user?.id as string, // Use session data correctly
      },
    });
    res.json(message);
  } else {
    res.status(405).end();
  }

  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const messages = await prisma.message.findMany({
      where: { userId: userId as string },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return res.json(messages);
  }

  res.status(405).end();
}

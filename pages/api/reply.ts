import { prisma } from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (session?.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { id, reply } = req.body;
    const message = await prisma.message.update({
      where: { id },
      data: { reply },
    });
    return res.json(message);
  } else {
    return res.status(405).end();
  }
}

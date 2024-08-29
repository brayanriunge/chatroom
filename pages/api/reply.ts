// import { prisma } from "@/utils/db";
// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "./auth/[...nextauth]";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = await getServerSession(req, res, authOptions);

//   if (session?.user.role !== "ADMIN") {
//     return res.status(403).json({ error: "Unauthorized" });
//   }

//   if (req.method === "POST") {
//     const { id, reply } = req.body;
//     const message = await prisma.message.update({
//       where: { id },
//       data: { reply },
//     });
//     return res.json(message);
//   } else {
//     return res.status(405).end();
//   }
// }
// pages/api/reply.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import { getSession } from "next-auth/react";
// import { prisma } from "@/utils/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "./auth/[...nextauth]";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "POST") {
//     try {
//       const session = await getServerSession(req, res, authOptions);

//       if (!session || session.user.role !== "ADMIN" || !session.user.id) {
//         return res
//           .status(401)
//           .json({ error: "Unauthorized or User ID missing" });
//       }

//       const { messageId, content } = req.body;
//       const userId = session.user.id;

//       console.log("User ID:", userId); // Debugging line

//       const reply = await prisma.reply.create({
//         data: {
//           content,
//           message: { connect: { id: messageId } },
//           user: { connect: { id: userId } },
//         },
//       });

//       return res.status(200).json(reply);
//     } catch (error) {
//       console.error("Failed to create reply:", error);
//       return res.status(500).json({ error: "Failed to create reply" });
//     }
//   } else {
//     return res.status(405).json({ error: "Method not allowed" });
//   }
// }
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const session = await getServerSession(req, res, authOptions);
      console.log("this is session", session);
      if (!session || session.user.role !== "ADMIN" || !session.user.id) {
        return res
          .status(401)
          .json({ error: "Unauthorized or User ID missing" });
      }

      const { messageId, content } = req.body;
      const userId = session.user.id;

      console.log("User ID:", userId); // Debugging line

      const reply = await prisma.reply.create({
        data: {
          content,
          message: { connect: { id: messageId } },
          user: { connect: { id: userId } },
        },
      });

      return res.status(200).json(reply);
    } catch (error) {
      console.error("Failed to create reply:", error);
      return res.status(500).json({ error: "Failed to create reply" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

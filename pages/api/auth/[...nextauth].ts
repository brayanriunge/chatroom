import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth/next";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/utils/db";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcrypt";

const loginUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email address")
    .min(1, { message: "Required" }),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, { message: "Password must be greater than 8 characters long" })
    .max(20, { message: "Password must be less than 20 characters long" }),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      // profile(profile) {
      //   return Promise.resolve({ role: profile.role ?? "user" });
      // },
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        name: { type: "text", placeholder: "Username" },
        email: { type: "text", placeholder: "Email" },
        password: { type: "text", placeholder: "Password" },
      },
      async authorize(credentials, req) {
        const { email, password } = loginUserSchema.parse(credentials);

        const user = await prisma.user.findUnique({
          where: { email },
        });
        //check if user exists
        if (!user) throw new Error("email does not exist");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.JWT_SECRET,
};

export default NextAuth(authOptions);

// callbacks: {
//   // jwt({ token, user }) {
//   //   if(user) token.role = user.role
//   //   return token
//   // },
//   session({ session, token }) {
//     session.user.role = token.role
//     return session
//   },
//   async jwt({token, user}){
//     const
//   }

// session({ user, session }) {
//   if (session && user) {
//     session.user = {
//       ...session.user,
//       id: user.id,
//       role: session.user.role,
//     };
//   }
//   return session;
// },

// async jwt({ token, account, user, session }) {
//   // Persist the OAuth access_token and or the user id to the token right after signin
//   if (user) {
//     token.accessToken = account?.access_token;
//     token.id = user.id;
//     if (session && session.user && session.user.role) {
//       token.role = session.user.role;
//     }
//   }
//   return token;
// },

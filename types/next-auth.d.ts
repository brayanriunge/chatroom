import { Role } from "@prisma/client";
import type NextAuth, { DefaultSession, DefaultUser, User } from "next-auth";
import "next-auth/jwt";
import { DefaultJWT } from "next-auth/jwt";

type UserId = string;

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
  }
}
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    role: Role;
  }
}

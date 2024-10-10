import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
import GoogleProvider from 'next-auth/providers/google';


export default {
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
} satisfies NextAuthConfig



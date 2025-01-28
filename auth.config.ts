import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
import GoogleProvider from 'next-auth/providers/google';


// const isLocalhost = process.env.NODE_ENV === 'development'
// const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://ace-thetics.vercel.app'
export default {
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET!,
  trustHost: true,
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // token.isAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
      }
      return token
    },
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub
        // session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
} satisfies NextAuthConfig



import NextAuth from "next-auth";
import authConfig from "./auth.config";


export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
 
});

export async function isAdmin() {
  const session = await auth();
  return session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}
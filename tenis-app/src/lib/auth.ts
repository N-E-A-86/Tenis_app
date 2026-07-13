import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { supabaseAdmin } from "./supabase";

async function findOrCreateUser(
  email: string,
  name?: string,
  image?: string
): Promise<{ id: string; email: string; name: string | null; image: string | null; role: string } | null> {
  const { data: existing } = await supabaseAdmin
    .from("User")
    .select("id, email, name, image, role")
    .eq("email", email)
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await supabaseAdmin
    .from("User")
    .insert({ email, name: name || email.split("@")[0], image })
    .select("id, email, name, image, role")
    .single();

  return created ?? null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const dbUser = await findOrCreateUser(user.email, user.name ?? undefined, user.image ?? undefined);
        if (!dbUser) return false;
        user.id = dbUser.id;
        user.role = dbUser.role;
      }
      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user } = await supabaseAdmin
          .from("User")
          .select("*")
          .eq("email", credentials.email as string)
          .maybeSingle();

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});

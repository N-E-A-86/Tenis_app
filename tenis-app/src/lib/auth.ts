import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { db } from "./db";

async function findOrCreateUser(
  email: string,
  name?: string,
  image?: string
): Promise<{ id: string; email: string; name: string | null; image: string | null; role: string } | null> {
  const existing = await db.queryOne(
    'SELECT id, email, name, image, role FROM "User" WHERE email = $1',
    [email]
  );

  if (existing) return existing;

  const [created] = await db.query(
    'INSERT INTO "User" (email, name, image) VALUES ($1, $2, $3) RETURNING id, email, name, image, role',
    [email, name || email.split("@")[0], image]
  );

  return created;
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

        const user = await db.queryOne(
          'SELECT * FROM "User" WHERE email = $1',
          [credentials.email as string]
        );

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

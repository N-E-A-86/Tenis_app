import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

const adapter = PrismaAdapter(prisma) as any;
export default adapter;

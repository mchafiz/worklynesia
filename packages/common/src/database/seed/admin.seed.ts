// packages/common/prisma/seed/admin.seed.ts
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

export async function seedAdmin() {
  const email = "admin@worklynesia.com";
  const prisma = new PrismaClient();

  const exists = await prisma.userAuth.findUnique({ where: { email } });
  if (exists) {
    console.log("✅ Admin already exists");
    return;
  }

  const password = await bcrypt.hash("admin123", 10);

  await prisma.userAuth.create({
    data: {
      email,
      password,
      role: "admin",
      mustChangePassword: true,
      isActive: true,
    },
  });

  await prisma.userProfile.create({
    data: {
      email,
      fullName: "Super Admin",
      phoneNumber: "08123456789",
    },
  });

  console.log("✅ Admin seeded");
}

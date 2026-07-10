import bcrypt from "bcryptjs";
import { prisma } from "./config/prismaConfig.js";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log("\n=== Create Admin ===\n");

  const name = await ask("Name: ");
  const email = await ask("Email: ");
  const password = await ask("Password: ");

  if (!name || !email || !password) {
    console.error("All fields are required.");
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.error(`Admin with email "${email}" already exists.`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({ data: { name, email, password: hashed } });

  console.log(`\n✅ Admin created successfully!`);
  console.log(`   ID   : ${admin.id}`);
  console.log(`   Name : ${admin.name}`);
  console.log(`   Email: ${admin.email}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => { rl.close(); prisma.$disconnect(); });

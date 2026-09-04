import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const customer = await prisma.user.create({
    data: {
      role: "customer",
      name: "Mobility-X Test Customer",
      email: "testcustomer@mobilityx.local",
      phone: "+2348000000000",
      verificationStatus: "verified",
    },
  });

  console.log("Created test customer:");
  console.log(customer);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
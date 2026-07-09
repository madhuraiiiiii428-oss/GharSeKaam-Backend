import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './config/prismaConfig.js';

async function test() {
  try {
    console.log("Querying last 5 orders...");
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: {
          include: {
            user: true
          }
        }
      }
    });
    
    orders.forEach(order => {
      console.log(`Order #${order.id}`);
      console.log(`- customerId: ${order.customerId}`);
      console.log(`- customer exists: ${!!order.customer}`);
      if (order.customer) {
        console.log(`  - user exists: ${!!order.customer.user}`);
        if (order.customer.user) {
          console.log(`    - user name: "${order.customer.user.name}"`);
          console.log(`    - user email: "${order.customer.user.email}"`);
          console.log(`    - user phone: "${order.customer.user.phone}"`);
        }
        console.log(`  - Shopname: "${order.customer.Shopname}"`);
      }
      console.log("------------------------");
    });
  } catch (error) {
    console.error("Query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    name: 'free',
    displayName: 'Free',
    price: 0,
    limit: 3,
    features: ['3 imagens por mês', 'Todos os estilos', 'Download em alta qualidade'],
    highlighted: false,
    sortOrder: 0,
  },
  {
    name: 'starter',
    displayName: 'Starter',
    price: 9,
    limit: 30,
    features: ['30 imagens por mês', 'Todos os estilos', 'Download em alta qualidade', 'Histórico completo'],
    highlighted: false,
    sortOrder: 1,
  },
  {
    name: 'pro',
    displayName: 'Pro',
    price: 29,
    limit: 100,
    features: ['100 imagens por mês', 'Todos os estilos', 'Download em alta qualidade', 'Histórico completo', 'Suporte prioritário'],
    highlighted: true,
    sortOrder: 2,
  },
  {
    name: 'agency',
    displayName: 'Agency',
    price: 99,
    limit: null,
    features: ['Gerações ilimitadas', 'Todos os estilos', 'Download em alta qualidade', 'Histórico completo', 'Suporte dedicado'],
    highlighted: false,
    sortOrder: 3,
  },
];

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }
  console.log(`${plans.length} plans seeded.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

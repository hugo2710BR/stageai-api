import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.staging.deleteMany({
    where: {
      OR: [
        { status: 'failed' },
        { status: 'processing', resultUrl: null },
      ],
    },
  });

  console.log(`Deleted ${deleted.count} staging(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@greenforce.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log(`User found: ${user.email}, Role: ${user.role}`);
        console.log('Password hash exists:', !!user.password);
    } else {
        console.log('User NOT found');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

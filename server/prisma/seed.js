const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 清理数据
  await prisma.inventoryItem.deleteMany();
  await prisma.pendingAction.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.chore.deleteMany();
  await prisma.user.deleteMany();

  // 创建默认家长
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const parent = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: '管理员爸爸',
      role: 'PARENT',
      score: 0,
      chores: {
        create: [
          { name: '整理玩具', points: 10, icon: '🧸' },
          { name: '刷牙', points: 5, icon: '🦷' },
          { name: '洗手', points: 3, icon: '💧' }
        ]
      },
      rewards: {
        create: [
          { name: '看动画片', cost: 50, icon: '📺' },
          { name: '吃冰淇淋', cost: 100, icon: '🍦' }
        ]
      }
    }
  });

  console.log('Created parent:', parent.name);

  // 创建默认孩子
  const child = await prisma.user.create({
    data: {
      username: 'baby',
      password: hashedPassword,
      name: '乖宝宝',
      role: 'CHILD',
      parentId: parent.id,
      score: 50,
      chores: {
        create: [
           { name: '整理玩具', points: 10, icon: '🧸' },
           { name: '自己吃饭', points: 10, icon: '🍚' }
        ]
      },
      rewards: {
        create: [
           { name: '看动画片', cost: 50, icon: '📺' }
        ]
      }
    }
  });

  console.log('Created child:', child.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

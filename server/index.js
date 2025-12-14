const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_key_123';

app.use(cors());
app.use(express.json());

// Socket.IO 鉴权中间件
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('认证失败：未提供 token'));
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new Error('认证失败：无效的 token'));
    }

    // 将用户信息附加到 socket 对象
    socket.user = decoded;
    next();
  });
});

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id, '用户ID:', socket.user.id);

  // 用户加入家庭房间
  socket.on('join-family', async () => {
    try {
      const { familyId } = socket.user;
      if (familyId) {
        socket.join(`family-${familyId}`);
        console.log(`用户 ${socket.user.id} (${socket.user.name}) 加入了家庭房间: ${familyId}`);
      } else {
        // Fallback for very old users without familyId (should be handled by login backfill though)
        console.warn(`用户 ${socket.user.id} 没有 familyId`);
      }
    } catch (error) {
      console.error('加入房间失败:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

// 辅助函数：推送更新到用户 (Legacy support)
const notifyUser = (userId, event, data) => {
  io.to(`user-${userId}`).emit(event, data);
};

// 辅助函数：推送更新到家庭所有成员
const notifyFamily = async (userId, event, data) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    if (user.familyId) {
       // Broadcast to the entire family room
       io.to(`family-${user.familyId}`).emit(event, data);
    } else {
        // Fallback for legacy logic (should be rare)
        if (user.role === 'CHILD' && user.parentId) {
            notifyUser(userId, event, data);
            notifyUser(user.parentId, event, data);
        } else if (user.role === 'PARENT') {
            notifyUser(userId, event, data);
            const children = await prisma.user.findMany({
                where: { parentId: userId },
                select: { id: true }
            });
            children.forEach(child => notifyUser(child.id, event, data));
        }
    }
  } catch (error) {
    console.error('推送通知失败:', error);
  }
};

// --- Middleware ---

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  const { username, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: 'PARENT',
        familyId: randomUUID(),
      },
    });
    // Create token
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, familyId: user.familyId }, SECRET_KEY);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, familyId: user.familyId } });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Username already exists' });
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    // Backfill familyId for legacy users
    if (!user.familyId) {
        const newFamilyId = randomUUID();
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { familyId: newFamilyId }
            }),
            prisma.user.updateMany({
                where: { parentId: user.id },
                data: { familyId: newFamilyId }
            })
        ]);
        user.familyId = newFamilyId;
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, familyId: user.familyId }, SECRET_KEY);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, familyId: user.familyId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/create-child', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  
  const { username, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const child = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: 'CHILD',
        parentId: req.user.id,
        familyId: req.user.familyId,
        score: 0,
      },
    });
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/create-parent', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  
  const { username, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const parent = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: 'PARENT',
        familyId: req.user.familyId,
        // Optional: track who created this parent, or leave parentId null
      },
    });
    res.json(parent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- User Data Routes ---

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'PARENT') {
      const users = await prisma.user.findMany({
        where: {
          familyId: req.user.familyId
        },
        include: { chores: true, rewards: true, inventory: true }
      });
      res.json(users);
    } else {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { chores: true, rewards: true, inventory: true }
      });
      res.json([user]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (req.user.role === 'CHILD' && req.user.id !== targetId) return res.sendStatus(403);
  if (req.user.role === 'PARENT') {
     const target = await prisma.user.findUnique({ where: { id: targetId }});
     if (target.familyId !== req.user.familyId) return res.sendStatus(403);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      include: { chores: true, rewards: true, inventory: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  const targetId = parseInt(req.params.id);
  const { name, birthDate, gender } = req.body;

  try {
    const target = await prisma.user.findUnique({ where: { id: targetId }});
    if (!target || target.familyId !== req.user.familyId) {
      return res.sendStatus(403);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (gender !== undefined) updateData.gender = gender;

    const user = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/reset-password', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  const targetId = parseInt(req.params.id);
  const { newPassword } = req.body;

  try {
    const target = await prisma.user.findUnique({ where: { id: targetId }});
    if (!target || target.familyId !== req.user.familyId) {
      return res.sendStatus(403);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: targetId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  const targetId = parseInt(req.params.id);
  const target = await prisma.user.findUnique({ where: { id: targetId }});
  if (target.familyId !== req.user.familyId) return res.sendStatus(403);

  try {
    await prisma.user.delete({ where: { id: targetId } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Action Routes ---

app.post('/api/chores', authenticateToken, async (req, res) => {
  const { userId, name, points, icon } = req.body;
  try {
    const chore = await prisma.chore.create({
      data: { userId, name, points, icon },
    });

    // 实时推送通知
    await notifyFamily(userId, 'data-updated', { type: 'chore-added', userId });

    res.json(chore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/chores/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  const id = parseInt(req.params.id);
  const deleteAll = req.query.all === 'true';

  try {
    const chore = await prisma.chore.findUnique({ where: { id }, include: { user: true } });
    if (!chore) return res.status(404).json({ error: 'Chore not found' });

    // Check ownership (must be in my family)
    if (chore.user.familyId !== req.user.familyId) return res.sendStatus(403);

    const affectedUserId = chore.userId;

    if (deleteAll) {
        // Delete all chores with same name for all my children
        await prisma.chore.deleteMany({
            where: {
                name: chore.name,
                user: { familyId: req.user.familyId, role: 'CHILD' }
            }
        });

        // 通知所有孩子
        const children = await prisma.user.findMany({
          where: { familyId: req.user.familyId, role: 'CHILD' },
          select: { id: true }
        });
        for (const child of children) {
          await notifyFamily(child.id, 'data-updated', { type: 'chore-deleted', userId: child.id });
        }

        res.json({ message: 'Deleted all chores' });
    } else {
        await prisma.chore.delete({ where: { id } });

        // 实时推送通知
        await notifyFamily(affectedUserId, 'data-updated', { type: 'chore-deleted', userId: affectedUserId });

        res.json({ message: 'Chore deleted' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rewards', authenticateToken, async (req, res) => {
  const { userId, name, cost, icon } = req.body;
  try {
    const reward = await prisma.reward.create({
      data: { userId, name, cost, icon },
    });

    // 实时推送通知
    await notifyFamily(userId, 'data-updated', { type: 'reward-added', userId });

    res.json(reward);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/rewards/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  const id = parseInt(req.params.id);
  const deleteAll = req.query.all === 'true';

  try {
    const reward = await prisma.reward.findUnique({ where: { id }, include: { user: true } });
    if (!reward) return res.status(404).json({ error: 'Reward not found' });

    if (reward.user.familyId !== req.user.familyId) return res.sendStatus(403);

    const affectedUserId = reward.userId;

    if (deleteAll) {
        await prisma.reward.deleteMany({
            where: {
                name: reward.name,
                user: { familyId: req.user.familyId, role: 'CHILD' }
            }
        });

        // 通知所有孩子
        const children = await prisma.user.findMany({
          where: { familyId: req.user.familyId, role: 'CHILD' },
          select: { id: true }
        });
        for (const child of children) {
          await notifyFamily(child.id, 'data-updated', { type: 'reward-deleted', userId: child.id });
        }

        res.json({ message: 'Deleted all rewards' });
    } else {
        await prisma.reward.delete({ where: { id } });

        // 实时推送通知
        await notifyFamily(affectedUserId, 'data-updated', { type: 'reward-deleted', userId: affectedUserId });

        res.json({ message: 'Reward deleted' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/actions/submit', authenticateToken, async (req, res) => {
  const { userId, choreId } = req.body;
  try {
    const chore = await prisma.chore.findUnique({ where: { id: choreId } });
    await prisma.pendingAction.create({
      data: {
        userId,
        choreName: chore.name,
        points: chore.points,
        icon: chore.icon,
      },
    });

    // 实时推送通知
    await notifyFamily(userId, 'data-updated', { type: 'chore-submitted', userId });

    res.json({ message: 'Submitted for approval' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pending', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  try {
    const pending = await prisma.pendingAction.findMany({
      where: {
        user: { familyId: req.user.familyId }
      },
      include: { user: true },
    });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/actions/approve/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  const id = parseInt(req.params.id);
  try {
    const action = await prisma.pendingAction.findUnique({ where: { id } });
    if (!action) return res.status(404).json({ error: 'Action not found' });
    const child = await prisma.user.findUnique({ where: { id: action.userId }});
    if (child.familyId !== req.user.familyId) return res.sendStatus(403);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: action.userId },
        data: { score: { increment: action.points } },
      }),
      // Add History
      prisma.history.create({
        data: {
          userId: action.userId,
          type: 'CHORE',
          name: action.choreName,
          amount: action.points,
          icon: action.icon
        }
      }),
      prisma.pendingAction.delete({ where: { id } }),
    ]);

    // 实时推送通知
    await notifyFamily(action.userId, 'data-updated', { type: 'chore-approved', userId: action.userId });

    res.json({ message: 'Approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/actions/reject/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  const id = parseInt(req.params.id);
  try {
    const action = await prisma.pendingAction.findUnique({ where: { id } });
    const userId = action?.userId;

    await prisma.pendingAction.delete({ where: { id } });

    // 实时推送通知
    if (userId) {
      await notifyFamily(userId, 'data-updated', { type: 'chore-rejected', userId });
    }

    res.json({ message: 'Rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/actions/complete-direct', authenticateToken, async (req, res) => {
    if (req.user.role !== 'PARENT') return res.sendStatus(403);
    const { userId, choreId } = req.body;
    try {
        const chore = await prisma.chore.findUnique({ where: { id: choreId }});
        await prisma.$transaction([
          prisma.user.update({
              where: { id: userId },
              data: { score: { increment: chore.points }}
          }),
          // Add History
          prisma.history.create({
            data: {
              userId,
              type: 'CHORE',
              name: chore.name,
              amount: chore.points,
              icon: chore.icon
            }
          })
        ]);

        // 实时推送通知
        await notifyFamily(userId, 'data-updated', { type: 'chore-completed', userId });

        res.json({ message: 'Completed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/actions/redeem', authenticateToken, async (req, res) => {
  const { userId, rewardId } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });

    if (user.score < reward.cost) {
      return res.status(400).json({ error: 'Not enough points' });
    }

    // 检查是否已经存在相同的奖励
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        userId,
        rewardName: reward.name,
        icon: reward.icon
      }
    });

    await prisma.$transaction([
      // 扣除积分
      prisma.user.update({
        where: { id: userId },
        data: { score: { decrement: reward.cost } },
      }),
      // 如果已存在，增加数量；否则创建新记录
      existingItem
        ? prisma.inventoryItem.update({
            where: { id: existingItem.id },
            data: { count: { increment: 1 } }
          })
        : prisma.inventoryItem.create({
            data: {
              userId,
              rewardName: reward.name,
              icon: reward.icon,
              count: 1,
            },
          }),
      // 添加历史记录
      prisma.history.create({
        data: {
          userId,
          type: 'REWARD',
          name: reward.name,
          amount: reward.cost,
          icon: reward.icon
        }
      })
    ]);

    // 实时推送通知
    await notifyFamily(userId, 'data-updated', { type: 'reward-redeemed', userId });

    res.json({ message: 'Redeemed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/actions/use-reward', authenticateToken, async (req, res) => {
  const { itemId } = req.body;
  try {
    // 先获取库存项信息
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // 使用事务：如果数量大于1就减1，否则删除记录，并创建历史记录
    await prisma.$transaction([
      // 如果数量大于1，减少数量；否则删除记录
      item.count > 1
        ? prisma.inventoryItem.update({
            where: { id: itemId },
            data: { count: { decrement: 1 } }
          })
        : prisma.inventoryItem.delete({ where: { id: itemId } }),
      // 创建历史记录
      prisma.history.create({
        data: {
          userId: item.userId,
          type: 'USE_REWARD',
          name: item.rewardName,
          amount: 0, // 使用奖励不涉及积分变化
          icon: item.icon,
        }
      })
    ]);

    // 实时推送通知
    await notifyFamily(item.userId, 'data-updated', { type: 'reward-used', userId: item.userId });

    res.json({ message: 'Used' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/score/reset', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') return res.sendStatus(403);
  const { userId } = req.body;
  try {
    await prisma.$transaction([
       prisma.user.update({ where: { id: userId }, data: { score: 0 } }),
       prisma.history.deleteMany({ where: { userId } }) // Clean history too? Maybe yes.
    ]);
    res.json({ message: 'Score reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// History endpoint
app.get('/api/history/:userId', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const history = await prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50 events
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

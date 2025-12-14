# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

这是一个名为"小帮手积分系统"的全栈 Web 应用 - 一个为家庭设计的游戏化家务和奖励追踪系统，支持家长和孩子两种角色。

## 架构设计

**客户端-服务器架构**：采用前后端分离的现代化架构：
- **客户端**：React 19 + Vite + Tailwind CSS 单页应用
- **服务器**：Node.js + Express + Prisma ORM
- **数据库**：SQLite（通过 Prisma）

### 目录结构

```
little-helper/
├── client/              # React 前端应用
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # UI 组件
│   │   ├── api.js      # API 调用封装
│   │   └── App.jsx     # 主应用组件
│   ├── package.json
│   └── vite.config.js
├── server/              # Node.js 后端
│   ├── prisma/
│   │   ├── schema.prisma # 数据库模型
│   │   └── seed.js       # 种子数据
│   ├── index.js         # Express 服务器
│   └── package.json
└── index.html           # 旧版单文件应用（已弃用）
```

## 数据模型

**Prisma Schema** (`server/prisma/schema.prisma`)：

- **User**：用户模型，支持家长和孩子两种角色
  - 家长可以有多个孩子账户
  - 孩子账户与家长关联
  - 字段：username, password, name, score, role (PARENT/CHILD), parentId

- **Chore**：家务任务
  - 字段：name, points, icon, userId
  - 关联到具体用户

- **Reward**：奖励项目
  - 字段：name, cost, icon, userId
  - 关联到具体用户

- **PendingAction**：待审批的家务记录
  - 孩子完成家务后提交，等待家长审批
  - 字段：choreName, points, icon, submitTime, userId

- **InventoryItem**：孩子的奖励库存
  - 记录孩子已兑换但未使用的奖励
  - 字段：rewardName, icon, count, userId

- **History**：历史记录
  - 记录所有家务完成和奖励兑换
  - 字段：type (CHORE/REWARD), name, amount, icon, createdAt, userId

## 核心功能

### 前端页面 (`client/src/pages/`)

1. **Home.jsx**：首页，用户选择角色进入
2. **Login.jsx**：登录页面
3. **Register.jsx**：注册页面（仅家长）
4. **ParentDashboard.jsx**：家长控制台
   - 管理孩子账户
   - 添加/编辑家务和奖励
   - 审批孩子提交的家务
5. **ChildDashboard.jsx**：孩子控制台
   - 查看并完成家务任务
   - 兑换奖励
   - 查看积分和历史记录

### 主要组件 (`client/src/components/`)

- **UserSelector.jsx**：用户选择器（家长切换管理的孩子）
- **ChoreList.jsx**：家务列表
- **RewardList.jsx**：奖励列表
- **PendingList.jsx**：待审批列表
- **HistoryList.jsx**：历史记录列表
- **MyRewardList.jsx**：我的奖励库存
- **ManageTab.jsx**：管理标签页
- **ScoreDisplay.jsx**：积分显示组件
- **EmojiPicker.jsx**：表情图标选择器
- **BottomNav.jsx**：底部导航栏
- **Modal.jsx**：模态框组件
- **CartoonAlert.jsx**：卡通风格提示框

### API 路由 (`server/index.js`)

**认证路由**：
- `POST /api/auth/register`：注册家长账户
- `POST /api/auth/login`：用户登录
- `POST /api/auth/child/register`：家长创建孩子账户

**用户路由**：
- `GET /api/users/me`：获取当前用户信息
- `GET /api/users/children`：获取家长的所有孩子
- `GET /api/users/:id`：获取指定用户信息

**家务路由**：
- `GET /api/chores/:userId`：获取用户的家务列表
- `POST /api/chores`：创建家务
- `DELETE /api/chores/:id`：删除家务

**奖励路由**：
- `GET /api/rewards/:userId`：获取用户的奖励列表
- `POST /api/rewards`：创建奖励
- `DELETE /api/rewards/:id`：删除奖励

**待审批路由**：
- `POST /api/pending`：提交待审批家务
- `GET /api/pending/:userId`：获取用户的待审批列表
- `POST /api/pending/:id/approve`：批准家务
- `DELETE /api/pending/:id`：拒绝/删除待审批

**库存路由**：
- `GET /api/inventory/:userId`：获取用户的奖励库存
- `POST /api/inventory/redeem`：兑换奖励

**历史路由**：
- `GET /api/history/:userId`：获取用户的历史记录

## 开发

### 安装依赖

```bash
# 安装服务器依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install
```

### 数据库设置

```bash
cd server
npx prisma migrate dev    # 运行数据库迁移
npx prisma db seed        # 填充种子数据（可选）
```

### 运行应用

**开发模式**：

```bash
# 终端 1：启动后端服务器（端口 3000）
cd server
npm run dev

# 终端 2：启动前端开发服务器（端口 5173）
cd client
npm run dev
```

访问 `http://localhost:5173` 查看应用。

**生产构建**：

```bash
# 构建前端
cd client
npm run build

# 生产环境运行服务器
cd ../server
npm start
```

### 技术栈

**前端**：
- React 19
- React Router DOM
- Vite (构建工具)
- Tailwind CSS (样式)
- Axios (HTTP 客户端)
- Framer Motion (动画)
- Lucide React (图标)

**后端**：
- Node.js
- Express 5
- Prisma ORM
- SQLite 数据库
- JWT 认证
- bcryptjs (密码哈希)

## 本地化

应用使用简体中文（zh-CN）。所有 UI 文本、按钮标签、消息提示都使用中文。

## 认证流程

1. 家长注册账户后自动登录
2. 家长可以创建多个孩子账户
3. 登录时选择角色（家长/孩子）并输入用户名和密码
4. JWT token 存储在 localStorage 中
5. 所有 API 请求通过 Authorization header 发送 token

## 工作流程

**家长工作流**：
1. 登录家长账户
2. 创建孩子账户
3. 为孩子添加家务任务和奖励
4. 审批孩子提交的家务记录
5. 查看孩子的积分和历史记录

**孩子工作流**：
1. 登录孩子账户
2. 查看可做的家务列表
3. 完成家务后提交审批
4. 等待家长批准后获得积分
5. 使用积分兑换奖励
6. 查看我的奖励库存和历史记录

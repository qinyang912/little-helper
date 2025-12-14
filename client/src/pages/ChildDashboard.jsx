import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Trophy, Gift as GiftIcon, Zap, TrendingUp } from 'lucide-react';
import * as api from '../api';
import { connectSocket, disconnectSocket, onDataUpdate, offDataUpdate } from '../socket';
import BottomNav from '../components/BottomNav';
import ChoreList from '../components/ChoreList';
import RewardList from '../components/RewardList';
import MyRewardList from '../components/MyRewardList';
import HistoryList from '../components/HistoryList';
import CartoonAlert from '../components/CartoonAlert';

const ChildDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chores');
  const [loading, setLoading] = useState(true);
  const [scoreAnimate, setScoreAnimate] = useState(false);

  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'chore',
    title: '',
    message: '',
    actionLabel: '',
    onAction: null
  });

  useEffect(() => {
    fetchMyData();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    // 连接到 Socket (加入家庭房间)
    connectSocket();

    const handleDataUpdate = (data) => {
      console.log('收到实时更新:', data);
      fetchMyData();
    };

    onDataUpdate(handleDataUpdate);

    return () => {
      offDataUpdate(handleDataUpdate);
      disconnectSocket();
    };
  }, [currentUser?.id]);

  // 积分变化时触发动画
  useEffect(() => {
    if (currentUser?.score !== undefined) {
      setScoreAnimate(true);
      const timer = setTimeout(() => setScoreAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentUser?.score]);

  const fetchMyData = async () => {
    try {
      const { data } = await api.getUsers();
      if (data.length > 0) {
        setCurrentUser(data[0]);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const showAlert = (config) => {
    setAlertState({ isOpen: true, ...config });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleChoreSubmit = async (chore) => {
    try {
      await api.submitChore(currentUser.id, chore.id);
      showAlert({
        type: 'chore',
        title: '太棒啦！🎉',
        message: `你完成了 "${chore.name}"！\n我已经告诉爸爸妈妈了，\n等他们检查一下哦！`,
        actionLabel: '好的，我知道啦',
        onAction: null
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRedeemReward = async (reward) => {
    try {
      await api.redeemReward(currentUser.id, reward.id);
      fetchMyData();
      showAlert({
        type: 'reward',
        title: '兑换成功！🎁',
        message: `哇！你得到了 "${reward.name}"！\n它已经放进你的小书包里啦！`,
        actionLabel: '去看看我的包包 👉',
        onAction: () => setActiveTab('myRewards')
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: '哎呀！',
        message: '你的星星好像不够哦！\n再去做点家务赚星星吧！💪',
        actionLabel: '我要去赚星星',
        onAction: () => setActiveTab('chores')
      });
    }
  };

  const handleUseReward = async (itemId) => {
    try {
      await api.useReward(itemId);
      fetchMyData();
      showAlert({
        type: 'use',
        title: '使用成功！✨',
        message: '开心享受你的奖励吧！',
        actionLabel: '开心！😄',
        onAction: null
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 计算统计数据
  const getStats = () => {
    if (!currentUser) return { totalTasks: 0, canAfford: 0, inventoryCount: 0 };

    return {
      totalTasks: currentUser.chores?.length || 0,
      canAfford: currentUser.rewards?.filter(r => r.cost <= currentUser.score).length || 0,
      inventoryCount: currentUser.inventory?.reduce((sum, item) => sum + item.count, 0) || 0
    };
  };

  const stats = getStats();

  // 获取问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '深夜好';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  };

  // 获取鼓励语
  const getEncouragement = () => {
    const score = currentUser?.score || 0;
    if (score === 0) return '开始你的第一个任务吧！';
    if (score < 20) return '继续加油！';
    if (score < 50) return '你真棒！';
    if (score < 100) return '太厉害了！';
    return '你是超级明星！';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🚀
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-24">
      {/* 顶部装饰波浪 */}
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C300,80 600,80 900,40 C1050,20 1150,0 1200,0 L1200,120 L0,120 Z" fill="url(#wave-gradient)" opacity="0.3"/>
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 固定顶栏 */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-purple-100/50 shadow-sm">
        <div className="container mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 可爱头像 */}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {currentUser?.name?.[0] || '👶'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>

              {/* 问候语 */}
              <div>
                <div className="text-sm text-gray-500 font-medium">{getGreeting()}</div>
                <div className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {currentUser?.name || '小宝贝'}
                </div>
              </div>
            </div>

            {/* 登出按钮 */}
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 text-red-400 hover:text-red-500 active:scale-95 transition-all shadow-sm"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-lg px-4 pt-6">
        {currentUser ? (
          <>
            {/* 积分展示卡片 - 重新设计 */}
            <motion.div
              animate={scoreAnimate ? { scale: [1, 1.05, 1] } : {}}
              className="relative mb-6"
            >
              {/* 背景光晕 */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>

              <div className="relative bg-white rounded-3xl shadow-xl border-4 border-white p-6 overflow-hidden">
                {/* 装饰性星星 */}
                <div className="absolute top-2 right-2 text-yellow-200 text-4xl opacity-50">✨</div>
                <div className="flex items-center justify-between">
                  {/* 左侧：积分信息 */}
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-400 mb-1">我的星星</div>
                    <div className="flex items-baseline gap-2">
                      <motion.div
                        key={currentUser.score}
                        initial={{ scale: 1.2, color: '#fbbf24' }}
                        animate={{ scale: 1, color: '#f59e0b' }}
                        className="text-6xl font-black bg-gradient-to-br from-yellow-500 to-orange-500 bg-clip-text text-transparent"
                      >
                        {currentUser.score}
                      </motion.div>
                      <div className="text-3xl mb-2">⭐</div>
                    </div>
                    <div className="text-xs font-bold text-purple-500 mt-1">
                      {getEncouragement()}
                    </div>
                  </div>

                  {/* 右侧：快速统计 */}
                  <div className="flex flex-col gap-2">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl px-3 py-2 text-center border border-blue-100">
                      <div className="text-xs text-blue-600 font-bold mb-0.5">可做任务</div>
                      <div className="text-2xl font-black text-blue-600">{stats.totalTasks}</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl px-3 py-2 text-center border border-pink-100">
                      <div className="text-xs text-pink-600 font-bold mb-0.5">可兑换</div>
                      <div className="text-2xl font-black text-pink-600">{stats.canAfford}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 内容区域 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {activeTab === 'chores' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Zap size={24} className="text-blue-500" />
                        我的任务
                      </h3>
                      {stats.totalTasks > 0 && (
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                          {stats.totalTasks} 个任务
                        </span>
                      )}
                    </div>
                    <ChoreList
                      chores={currentUser.chores || []}
                      mode="child"
                      onAction={handleChoreSubmit}
                    />
                  </div>
                )}

                {activeTab === 'rewards' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-2">
                        <GiftIcon size={24} className="text-pink-500" />
                        礼物商店
                      </h3>
                      {stats.canAfford > 0 && (
                        <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold animate-pulse">
                          {stats.canAfford} 个可换
                        </span>
                      )}
                    </div>
                    <RewardList
                      rewards={currentUser.rewards || []}
                      userScore={currentUser.score}
                      onRedeem={handleRedeemReward}
                    />
                  </div>
                )}

                {activeTab === 'myRewards' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Trophy size={24} className="text-amber-500" />
                        我的背包
                      </h3>
                      {stats.inventoryCount > 0 && (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                          {stats.inventoryCount} 件奖励
                        </span>
                      )}
                    </div>
                    <MyRewardList
                      inventory={currentUser.inventory || []}
                      onUse={handleUseReward}
                    />
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                        <TrendingUp size={24} className="text-emerald-500" />
                        成长记录
                      </h3>
                    </div>
                    <HistoryList
                      userId={currentUser.id}
                      inventory={currentUser.inventory || []}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* 底部导航 */}
            <BottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              mode="child"
            />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-8xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-gray-500">找不到用户信息</h2>
          </div>
        )}
      </div>

      {/* 弹窗组件 */}
      <CartoonAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        actionLabel={alertState.actionLabel}
        onClose={closeAlert}
        onAction={alertState.onAction}
      />
    </div>
  );
};

export default ChildDashboard;

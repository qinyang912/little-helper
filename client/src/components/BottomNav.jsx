import { motion } from 'framer-motion';
import {
  ListTodo,
  Gift,
  Backpack,
  Sparkles,
  ClipboardList,
  Award,
  History,
  Settings
} from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange, mode, pendingCount = 0 }) => {
  // 孩子端导航栏配置
  const childTabs = [
    {
      id: 'chores',
      label: '赚星星',
      Icon: ListTodo,
      color: 'from-blue-400 to-cyan-400',
      activeColor: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'rewards',
      label: '换礼物',
      Icon: Gift,
      color: 'from-pink-400 to-rose-400',
      activeColor: 'text-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'myRewards',
      label: '我的包包',
      Icon: Backpack,
      color: 'from-amber-400 to-orange-400',
      activeColor: 'text-amber-500',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'history',
      label: '成长记录',
      Icon: Sparkles,
      color: 'from-emerald-400 to-teal-400',
      activeColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
  ];

  // 家长端导航栏配置
  const parentTabs = [
    {
      id: 'chores',
      label: '任务管理',
      Icon: ClipboardList,
      color: 'from-blue-400 to-cyan-400',
      activeColor: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'rewards',
      label: '奖励管理',
      Icon: Award,
      color: 'from-pink-400 to-rose-400',
      activeColor: 'text-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'history',
      label: '历史记录',
      Icon: History,
      color: 'from-indigo-400 to-purple-400',
      activeColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'manage',
      label: '家庭设置',
      Icon: Settings,
      color: 'from-purple-400 to-fuchsia-400',
      activeColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      badge: pendingCount
    },
  ];

  const currentTabs = mode === 'parent' ? parentTabs : childTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      {/* 渐变遮罩，让导航栏上方有一个柔和的过渡 */}
      <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>

      {/* 导航栏主体 */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto max-w-lg px-2 sm:px-4">
          <div className="flex items-center justify-around py-2">
            {currentTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.Icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px] sm:min-w-[70px] group"
                >
                  {/* 徽章 */}
                  {tab.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 right-2 sm:right-4 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[10px] font-black text-white shadow-md z-10"
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </motion.div>
                  )}

                  {/* 图标背景 */}
                  <div className="relative">
                    {/* 活跃状态的背景光晕 */}
                    {isActive && (
                      <motion.div
                        layoutId={`${mode}-tab-bg`}
                        className={`absolute inset-0 rounded-2xl ${tab.bgColor} scale-150 opacity-50`}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {/* 图标容器 */}
                    <div className={`
                      relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl
                      transition-all duration-300
                      ${isActive
                        ? `bg-gradient-to-br ${tab.color} shadow-lg scale-110`
                        : 'bg-gray-100/50 group-hover:bg-gray-100 group-hover:scale-105'
                      }
                    `}>
                      <Icon
                        className={`
                          transition-all duration-300
                          ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}
                        `}
                        size={isActive ? 22 : 20}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>

                    {/* 活跃指示器 - 底部小点 */}
                    {isActive && (
                      <motion.div
                        layoutId={`${mode}-indicator`}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-500"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>

                  {/* 标签文字 */}
                  <span className={`
                    text-[10px] sm:text-[11px] font-bold transition-all duration-300 whitespace-nowrap
                    ${isActive
                      ? `${tab.activeColor} scale-105`
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;

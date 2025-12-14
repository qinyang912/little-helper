import React, { useEffect, useState } from 'react';
import * as api from '../api';

const HistoryList = ({ userId, inventory = [], onUseReward = null }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.getHistory(userId);
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 计算背包物品总数
  const getTotalInventoryCount = () => {
    return inventory.reduce((sum, item) => sum + item.count, 0);
  };

  return (
    <div className="space-y-6">

      {/* 1. Inventory Section */}
      <div className="rounded-3xl bg-white p-5 shadow-sm border-2 border-orange-100">
        <h3 className="text-lg font-black text-orange-500 mb-4 flex items-center gap-2">
            🎒 背包里的宝贝
            <span className="text-xs bg-orange-100 px-2 py-1 rounded-full">共 {getTotalInventoryCount()} 个</span>
        </h3>

        {inventory.length > 0 ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
             {inventory.map(item => (
                <div key={item.id} className="bg-orange-50 p-3 rounded-2xl border-2 border-orange-100 flex flex-col items-center">
                    <span className="text-4xl mb-2">{item.icon}</span>
                    <div className="text-center mb-2">
                      <div className="font-bold text-gray-700 text-sm mb-1">{item.rewardName}</div>
                      <div className="text-xs bg-orange-200 text-orange-700 font-bold px-2 py-0.5 rounded-full inline-block">
                        x{item.count}
                      </div>
                    </div>
                    {onUseReward && (
                      <button
                        onClick={() => onUseReward(item.id)}
                        className="w-full mt-2 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs font-bold py-2 px-3 rounded-xl hover:shadow-md active:scale-95 transition-all"
                      >
                        帮Ta使用
                      </button>
                    )}
                </div>
             ))}
           </div>
        ) : (
            <div className="text-center text-gray-400 text-sm py-4">包包是空的哦</div>
        )}
      </div>

      {/* 2. Timeline Section */}
      <div className="rounded-3xl bg-white p-5 shadow-sm border-2 border-blue-50">
        <h3 className="text-lg font-black text-blue-500 mb-4">📜 成长记录</h3>
        
        {loading ? (
            <div className="text-center text-gray-400 py-4">加载中...</div>
        ) : history.length > 0 ? (
            <div className="space-y-4 relative pl-4 border-l-2 border-gray-100 ml-2">
                {history.map(item => {
                    // 根据类型设置颜色和样式
                    const typeConfig = {
                        'CHORE': { dotColor: 'bg-[#06d6a0]', textColor: 'text-[#06d6a0]', prefix: '+', showAmount: true },
                        'REWARD': { dotColor: 'bg-[#ef476f]', textColor: 'text-[#ef476f]', prefix: '-', showAmount: true },
                        'USE_REWARD': { dotColor: 'bg-[#f59e0b]', textColor: 'text-[#f59e0b]', prefix: '', showAmount: false }
                    };
                    const config = typeConfig[item.type] || typeConfig['CHORE'];

                    return (
                        <div key={item.id} className="relative flex items-center justify-between group">
                            {/* Dot */}
                            <div className={`
                                absolute -left-[21px] h-3 w-3 rounded-full border-2 border-white shadow-sm
                                ${config.dotColor}
                            `}></div>

                            <div className="flex items-center gap-3">
                                <div className="text-2xl bg-gray-50 p-2 rounded-xl">{item.icon}</div>
                                <div>
                                    <div className="font-bold text-gray-700">{item.name}</div>
                                    <div className="text-xs text-gray-400">{formatDate(item.createdAt)}</div>
                                </div>
                            </div>

                            <div className={`font-black text-sm ${config.textColor}`}>
                                {config.showAmount
                                    ? `${config.prefix}${item.amount}`
                                    : '已使用 ✨'
                                }
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="text-center text-gray-400 py-10">还没有记录哦</div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;

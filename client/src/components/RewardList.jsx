import React from 'react';
import { Trash2 } from 'lucide-react';

const RewardList = ({ rewards, userScore, onRedeem, onDelete }) => {
  if (rewards.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-8xl mb-4 animate-pulse opacity-50">🎁</div>
        <div className="text-2xl font-bold text-gray-400">还没有礼物哦！</div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rewards.map((reward) => {
        const canAfford = userScore >= reward.cost;
        
        return (
          <div
            key={reward.id}
            className={`
              group relative flex flex-col items-center rounded-[30px] border-[3px] border-b-[8px] bg-white p-4 transition-transform
              ${canAfford ? 'border-[#ef476f]' : 'border-gray-200 opacity-80'}
            `}
          >
            {/* 删除按钮 (仅家长可见) */}
            {onDelete && (
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(reward); // Pass full object
                }}
                className="absolute right-3 top-3 rounded-full bg-gray-100 p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                >
                <Trash2 size={18} />
                </button>
            )}

            <div className="mb-2 text-[80px] leading-tight drop-shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-6">
              {reward.icon}
            </div>
            
            <h3 className="mb-1 text-2xl font-black text-gray-700">{reward.name}</h3>
            
            <div className="mb-4 rounded-full bg-[#ffe0e9] px-4 py-1 text-xl font-bold text-[#ef476f]">
              -{reward.cost} ⭐
            </div>
            
            <button
              onClick={() => canAfford && onRedeem(reward)}
              disabled={!canAfford}
              className={`
                w-full rounded-2xl border-b-[6px] py-3 text-xl font-black text-white transition-all
                ${canAfford
                  ? 'border-[#c9184a] bg-[#ef476f] hover:brightness-110 active:border-b-0 active:translate-y-2 cursor-pointer'
                  : 'border-gray-300 bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              {canAfford ? '我要这个! 👆' : '还不够哦 🔒'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default RewardList;
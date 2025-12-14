import React from 'react';

const MyRewardList = ({ inventory, onUse, mode = 'child' }) => {
  if (inventory.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-8xl mb-4 animate-pulse opacity-50">🎒</div>
        <div className="text-2xl font-bold text-gray-400">包包是空的</div>
        <div className="text-lg text-gray-400 mt-2">
          {mode === 'parent' ? '还没有兑换过奖励' : '快去换礼物吧！'}
        </div>
      </div>
    );
  }

  const buttonText = mode === 'parent' ? '帮Ta使用' : '现在使用 ✨';

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {inventory.map((item) => (
        <div
          key={item.id}
          className="group relative flex flex-col items-center rounded-[30px] border-[3px] border-b-[8px] border-[#ffd166] bg-white p-4"
        >
          <div className="mb-2 text-[80px] drop-shadow-sm transition-transform group-hover:scale-110">
            {item.icon}
          </div>

          <h3 className="mb-1 text-2xl font-black text-gray-700">{item.rewardName}</h3>

          <div className="mb-4 rounded-full bg-[#fff5d0] px-4 py-1 text-xl font-bold text-[#f59e0b]">
            还剩 {item.count} 个
          </div>

          <button
            onClick={() => onUse(item.id)}
            className="w-full rounded-2xl border-b-[6px] border-[#d97706] bg-[#f59e0b] py-3 text-xl font-black text-white transition-all active:border-b-0 active:translate-y-2 hover:brightness-110"
          >
            {buttonText}
          </button>
        </div>
      ))}
    </div>
  );
};

export default MyRewardList;
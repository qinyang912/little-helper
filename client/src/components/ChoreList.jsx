import React from 'react';
import { Trash2 } from 'lucide-react';

const ChoreList = ({ chores, mode, onAction, onDelete }) => {
  if (chores.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-8xl mb-4 animate-pulse opacity-50">🧹</div>
        <div className="text-2xl font-bold text-gray-400">没有家务啦！</div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {chores.map((chore) => (
        <div
          key={chore.id}
          className="group relative flex flex-col items-center rounded-[30px] border-[3px] border-b-[8px] border-[#4cc9f0] bg-white p-4 transition-transform hover:-translate-y-1"
        >
          {/* 删除按钮 (仅家长可见) */}
          {mode === 'parent' && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chore); // Pass full object
              }}
              className="absolute right-3 top-3 rounded-full bg-gray-100 p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}

          {/* 巨大的图标 */}
          <div className="mb-2 text-[80px] leading-tight drop-shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-6">
            {chore.icon}
          </div>
          
          <h3 className="mb-1 text-2xl font-black text-gray-700">{chore.name}</h3>
          
          <div className="mb-4 rounded-full bg-[#e0faff] px-4 py-1 text-xl font-bold text-[#0096c7]">
            +{chore.points} ⭐
          </div>
          
          <button
            onClick={() => onAction(chore)}
            className="w-full rounded-2xl border-b-[6px] border-[#0aa85f] bg-[#2ec4b6] py-3 text-xl font-black text-white active:border-b-0 active:translate-y-2 transition-all hover:brightness-110"
          >
            {mode === 'child' ? '我做完了! ✋' : '完成 ✅'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ChoreList;
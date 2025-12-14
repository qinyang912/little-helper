import React from 'react';

const PendingList = ({ pendingActions, onApprove, onReject }) => {
  if (pendingActions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-8xl mb-4 text-green-300">✅</div>
        <div className="text-2xl font-bold text-gray-400">全部审核完啦！</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingActions.map((action) => (
        <div
          key={action.id}
          className="flex flex-col items-center rounded-[30px] border-[3px] border-b-[8px] border-[#118ab2] bg-white p-4 sm:flex-row sm:justify-between"
        >
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#e0f7fa] text-4xl border-2 border-[#118ab2]">
              {action.icon}
            </div>
            <div className="text-left">
              <h3 className="text-xl font-black text-gray-800">{action.choreName}</h3>
              <div className="text-lg font-bold text-[#118ab2]">
                +{action.points} ⭐
              </div>
              <div className="mt-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">
                {action.user?.name} · {new Date(action.submitTime).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="flex w-full gap-2 sm:w-auto">
             <button
              onClick={() => onReject(action.id)}
              className="flex-1 rounded-xl border-b-[4px] border-[#c1121f] bg-[#ef233c] px-4 py-2 font-black text-white active:border-b-0 active:translate-y-1 transition-all"
            >
              拒绝 ❌
            </button>
            <button
              onClick={() => onApprove(action.id)}
              className="flex-[2] rounded-xl border-b-[4px] border-[#0aa85f] bg-[#2ec4b6] px-4 py-2 font-black text-white active:border-b-0 active:translate-y-1 transition-all"
            >
              通过 ✅
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingList;
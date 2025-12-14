import React from 'react';
import { X, Plus, Edit } from 'lucide-react';

const UserSelector = ({ users, currentUserId, onSelectUser, onDeleteUser, onAddUserClick, onEditUser }) => {
  return (
    <div className="mb-6 flex flex-wrap justify-center gap-4">
      {users.map((user) => {
        const isActive = user.id === currentUserId;
        const colors = ['bg-[#ff9f1c]', 'bg-[#2ec4b6]', 'bg-[#e71d36]', 'bg-[#3a86ff]'];
        const bgColor = colors[user.id % colors.length];

        return (
          <div key={user.id} className="relative group">
            <button
              onClick={() => onSelectUser(user.id)}
              className={`
                relative flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[4px] transition-all
                ${isActive 
                  ? 'border-[#ff9e00] scale-110 z-10 shadow-lg' 
                  : 'border-white opacity-70 hover:opacity-100 hover:scale-105 bg-gray-200'
                }
              `}
            >
              <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white overflow-hidden ${bgColor}`}>
                 {user.name[0]}
              </div>
              
              {isActive && (
                <div className="absolute -bottom-8 whitespace-nowrap rounded-lg bg-[#ff9e00] px-2 py-0.5 text-xs sm:text-sm font-bold text-white shadow-sm z-20">
                  {user.name}
                </div>
              )}
            </button>

            {/* 编辑按钮 */}
            {onEditUser && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditUser(user);
                }}
                className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white shadow-sm transition-transform hover:scale-110 z-20"
              >
                <Edit size={12} />
              </button>
            )}

            {/* 删除按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteUser(user.id);
              }}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-sm transition-transform hover:scale-110 z-20"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}

      {/* 添加按钮 */}
      <button
        onClick={onAddUserClick}
        className="
          flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 
          rounded-full border-[4px] border-dashed border-gray-300 bg-white/50
          text-gray-400 hover:text-[#ff9e00] hover:border-[#ff9e00] hover:bg-white
          transition-all active:scale-95
        "
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default UserSelector;

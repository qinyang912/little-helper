import React from 'react';
import { User, Shield } from 'lucide-react';
import { jwtDecode } from "jwt-decode";

const FamilyMembersList = ({ users }) => {
  const parents = users.filter(u => u.role === 'PARENT');
  const children = users.filter(u => u.role === 'CHILD');
  
  const token = localStorage.getItem('token');
  let currentUserId = null;
  if (token) {
      try {
          const payload = jwtDecode(token);
          currentUserId = payload.id;
      } catch (e) {
          console.error('Error decoding token', e);
      }
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide px-2">家庭成员</h4>
      
      <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-purple-50">
        {/* Parents Section */}
        <div className="mb-4">
          <h5 className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
            <Shield size={12} />
            家长 ({parents.length})
          </h5>
          <div className="space-y-2">
            {parents.map(parent => (
              <div 
                key={parent.id}
                className={`flex items-center gap-3 p-2 rounded-xl ${String(parent.id) === String(currentUserId) ? 'bg-purple-50 border border-purple-100' : 'hover:bg-gray-50'}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold shadow-sm">
                  {parent.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-700 flex items-center gap-2">
                    {parent.name}
                    {String(parent.id) === String(currentUserId) && (
                      <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">我</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{parent.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Children Section */}
        <div>
          <h5 className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
            <User size={12} />
            宝贝 ({children.length})
          </h5>
          <div className="space-y-2">
            {children.map(child => (
              <div 
                key={child.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold shadow-sm">
                  {child.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-700">{child.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{child.username}</span>
                    <span className="text-yellow-500 font-bold flex items-center gap-0.5">
                      ⭐ {child.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMembersList;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import * as api from '../api';
import { connectSocket, disconnectSocket, onDataUpdate, offDataUpdate } from '../socket';
import ScoreDisplay from '../components/ScoreDisplay';
import BottomNav from '../components/BottomNav';
import UserSelector from '../components/UserSelector';
import ChoreList from '../components/ChoreList';
import RewardList from '../components/RewardList';
import PendingList from '../components/PendingList';
import ManageTab from '../components/ManageTab';
import HistoryList from '../components/HistoryList';
import Modal from '../components/Modal';
import CartoonAlert from '../components/CartoonAlert';
import EditChildProfile from '../components/EditChildProfile';
import { LogOut, Bell } from 'lucide-react'; 

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); 
  const [children, setChildren] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null); // The logged-in parent
  
  const [selectedUserId, setSelectedUserId] = useState(null); 
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('chores'); 
  const [pendingActions, setPendingActions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('CHILD');

  // Generic Confirm Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    emoji: '🤔',
    confirmText: '确定',
    confirmColor: 'bg-blue-500',
    onConfirm: null,
    options: null // Array of buttons: { text, color, action }
  });

  // Alert State
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'info', 
    title: '',
    message: '',
    actionLabel: '',
    onAction: null
  });

  const showAlert = (config) => {
    setAlertState({
      isOpen: true,
      ...config
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const openConfirm = (config) => {
    setConfirmState({
      isOpen: true,
      emoji: '🤔',
      confirmText: '确定',
      confirmColor: 'bg-blue-500',
      options: null,
      ...config
    });
  };

  const closeConfirm = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async (action) => {
    const fn = action || confirmState.onConfirm;
    if (fn) {
      await fn();
    }
    closeConfirm();
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingActions();
  }, []);

  // Socket.IO 实时更新
  useEffect(() => {
    // 连接 Socket
    connectSocket();

    // 监听数据更新
    const handleDataUpdate = (data) => {
      console.log('收到实时更新:', data);
      fetchUsers();
      fetchPendingActions();
    };

    onDataUpdate(handleDataUpdate);

    // 清理函数
    return () => {
      offDataUpdate(handleDataUpdate);
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (users.length > 0 && selectedUserId) {
        const user = users.find(u => u.id === selectedUserId);
        setSelectedUser(user);
    }
  }, [selectedUserId, users]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.getUsers();
      setUsers(data);
      
      const childrenUsers = data.filter(u => u.role === 'CHILD');
      
      // Get current logged in user ID from token
      const token = localStorage.getItem('token');
      if (token) {
        try {
            const payload = jwtDecode(token);
            const myId = payload.id;
            const me = data.find(u => u.id === myId);
            setCurrentUser(me);
        } catch (e) {
            console.error('Token decode error:', e);
        }
      }

      setChildren(childrenUsers);

      if (!selectedUserId) {
         if (childrenUsers.length > 0) setSelectedUserId(childrenUsers[0].id);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingActions = async () => {
    try {
      const { data } = await api.getPendingActions();
      setPendingActions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddUser = async () => {
    if (!newUserName.trim()) return;
    try {
      const username = newUserName + Math.floor(Math.random() * 1000);
      
      if (newUserRole === 'CHILD') {
        await api.createChild(username, '123456', newUserName);
      } else {
        await api.createParent(username, '123456', newUserName);
      }

      setNewUserName('');
      setShowAddUserModal(false);
      fetchUsers();
      
      const roleName = newUserRole === 'CHILD' ? '宝贝' : '家长';
      showAlert({
        type: 'success',
        title: '添加成功！🎉',
        message: `${roleName} "${newUserName}" 的账号创建好了！\n登录名: ${username}\n默认密码: 123456`,
        actionLabel: '好的，记住了'
      });
    } catch (error) {
      console.error(error);
      showAlert({
        type: 'error',
        title: '创建失败',
        message: '出了点小问题，请稍后再试。',
        actionLabel: '好的'
      });
    }
  };

  const handleEditUser = (child) => {
    setEditingChild(child);
    setShowEditChildModal(true);
  };

  const handleSaveChildInfo = async (formData) => {
    try {
      await api.updateUser(editingChild.id, formData);
      fetchUsers();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleResetChildPassword = async (newPassword) => {
    try {
      await api.resetPassword(editingChild.id, newPassword);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteUser = (id) => {
    openConfirm({
        title: '⚠️ 确认删除？',
        message: '所有星星和记录都会消失，不能找回了哦！',
        emoji: '🗑️',
        confirmText: '确认删除',
        confirmColor: 'bg-red-500',
        onConfirm: async () => {
            try {
                await api.deleteUser(id);
                fetchUsers();
            } catch (error) {
                console.error(error);
            }
        }
    });
  };

  // Delete Chore Handler
  const handleDeleteChore = (chore) => {
    const hasMultipleChildren = children.length > 1;

    openConfirm({
        title: '删除任务',
        message: `要怎么删除 "${chore.name}"？`,
        emoji: '🗑️',
        options: hasMultipleChildren ? [
            {
                text: '只删除这个宝贝的',
                color: 'bg-orange-400',
                action: async () => {
                    await api.deleteChore(chore.id, false);
                    fetchUsers();
                }
            },
            {
                text: '删除所有宝贝的同名任务',
                color: 'bg-red-500',
                action: async () => {
                    await api.deleteChore(chore.id, true);
                    fetchUsers();
                }
            }
        ] : null,
        confirmText: '确认删除',
        confirmColor: 'bg-red-500',
        onConfirm: async () => {
            await api.deleteChore(chore.id, false);
            fetchUsers();
        }
    });
  };

  // Delete Reward Handler
  const handleDeleteReward = (reward) => {
    const hasMultipleChildren = children.length > 1;

    openConfirm({
        title: '删除礼物',
        message: `要怎么删除 "${reward.name}"？`,
        emoji: '🗑️',
        options: hasMultipleChildren ? [
            {
                text: '只删除这个宝贝的',
                color: 'bg-orange-400',
                action: async () => {
                    await api.deleteReward(reward.id, false);
                    fetchUsers();
                }
            },
            {
                text: '删除所有宝贝的同名礼物',
                color: 'bg-red-500',
                action: async () => {
                    await api.deleteReward(reward.id, true);
                    fetchUsers();
                }
            }
        ] : null,
        confirmText: '确认删除',
        confirmColor: 'bg-red-500',
        onConfirm: async () => {
            await api.deleteReward(reward.id, false);
            fetchUsers();
        }
    });
  };

  const handleResetScore = () => {
    openConfirm({
        title: '⚠️ 确认重置？',
        message: `确定要清空 ${selectedUser?.name} 的所有星星吗？此操作不可撤销！`,
        emoji: '😱',
        confirmText: '是的，清空！',
        confirmColor: 'bg-red-500',
        onConfirm: async () => {
            try {
                await api.resetScore(selectedUser.id);
                fetchUsers();
            } catch (error) {
                console.error(error);
            }
        }
    });
  };

  const handleApprove = async (pendingId) => {
    try {
      await api.approveChore(pendingId);
      fetchPendingActions();
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (pendingId) => {
    openConfirm({
        title: '确认拒绝？',
        message: '确定要拒绝这个任务申请吗？',
        emoji: '🙅',
        confirmText: '拒绝',
        confirmColor: 'bg-red-500',
        onConfirm: async () => {
            try {
                await api.rejectChore(pendingId);
                fetchPendingActions();
            } catch (error) {
                console.error(error);
            }
        }
    });
  };

  const handleDirectComplete = async (chore) => {
    openConfirm({
        title: '直接完成？',
        message: `确定要直接帮 ${selectedUser.name} 完成 "${chore.name}" 吗？`,
        emoji: '✅',
        confirmText: '是的，完成',
        confirmColor: 'bg-green-500',
        onConfirm: async () => {
            try {
                await api.completeChoreDirect(selectedUser.id, chore.id);
                fetchUsers();
            } catch (error) {
                console.error(error);
            }
        }
    });
  };

  const handleDirectRedeem = async (reward) => {
    openConfirm({
        title: '兑换奖励？',
        message: `确定要帮 ${selectedUser.name} 兑换 "${reward.name}" 吗？`,
        emoji: '🎁',
        confirmText: '兑换',
        confirmColor: 'bg-pink-500',
        onConfirm: async () => {
            try {
                await api.redeemReward(selectedUser.id, reward.id);
                fetchUsers();
            } catch (error) {
                 console.error(error);
                 showAlert({
                    type: 'error',
                    title: '积分不足',
                    message: `${selectedUser.name} 的星星不够兑换这个礼物哦！`,
                    actionLabel: '好的'
                 });
            }
        }
    });
  };

  const handleUseReward = async (itemId) => {
    openConfirm({
        title: '使用奖励？',
        message: `确定要帮 ${selectedUser.name} 使用这个奖励吗？`,
        emoji: '✨',
        confirmText: '确认使用',
        confirmColor: 'bg-orange-500',
        onConfirm: async () => {
            try {
                await api.useReward(itemId);
                fetchUsers();
                showAlert({
                    type: 'success',
                    title: '使用成功！',
                    message: `已帮 ${selectedUser.name} 使用奖励`,
                    actionLabel: '好的'
                });
            } catch (error) {
                console.error(error);
                showAlert({
                    type: 'error',
                    title: '使用失败',
                    message: '出了点小问题，请稍后再试',
                    actionLabel: '好的'
                });
            }
        }
    });
  };

  const handleAddChore = async (data, targetUserId) => {
    try {
      if (targetUserId === 'ALL') {
        const children = users.filter(u => u.role === 'CHILD');
        await Promise.all(children.map(child => api.createChore(child.id, data)));
      } else {
        await api.createChore(targetUserId, data);
      }
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddReward = async (data, targetUserId) => {
    try {
      if (targetUserId === 'ALL') {
        const children = users.filter(u => u.role === 'CHILD');
        await Promise.all(children.map(child => api.createReward(child.id, data)));
      } else {
        await api.createReward(targetUserId, data);
      }
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-[#ff9e00]">加载中...</div>;

  return (
    <div className="min-h-screen bg-[#fff3e0] pb-24">
      
       {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#fff3e0]/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="text-xl font-black text-[#ff9e00] truncate max-w-[60%]">
            {currentUser ? `👋 ${currentUser.name}` : '家长控制台'}
        </div>
        
        <div className="flex items-center gap-3">
            {/* Review Button */}
            <button 
                onClick={() => setShowReviewModal(true)}
                className="relative p-2 rounded-full bg-white text-[#118ab2] shadow-sm active:scale-90 transition-all"
            >
                <Bell size={20} />
                {pendingActions.length > 0 && (
                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
                )}
            </button>

            {/* Logout Button */}
            <button 
                onClick={handleLogout}
                className="p-2 rounded-full bg-white text-gray-400 shadow-sm active:scale-90 transition-all"
            >
                <LogOut size={20} />
            </button>
        </div>
      </div>

      <div className="container mx-auto max-w-lg px-4 pt-2">
        
        {/* 全局待审核提醒 */}
        {pendingActions.length > 0 && (
            <div className="mb-4 rounded-2xl bg-[#ffeb3b] p-3 text-center font-bold text-[#f57f17] shadow-sm animate-pulse cursor-pointer" onClick={() => setShowReviewModal(true)}>
              🔔 有 {pendingActions.length} 个任务等待审核！
            </div>
        )}

        {children.length > 0 ? (
          <>
            <UserSelector
              users={children}
              currentUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
              onDeleteUser={handleDeleteUser}
              onEditUser={handleEditUser}
              onAddUserClick={() => setShowAddUserModal(true)}
            />

            {selectedUser && (
              <>
                {/* 仅在非管理页面显示分数 */}
                {activeTab !== 'manage' && (
                    <ScoreDisplay score={selectedUser.score} userName={selectedUser.name} />
                )}

                <div className="mt-4 animate-fade-in">
                  
                  {activeTab === 'manage' && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-black text-[#8338ec] pl-2 opacity-80">家庭设置</h3>
                        <ManageTab 
                            users={users} 
                            currentUserId={selectedUserId}
                            onAddChore={handleAddChore}
                            onAddReward={handleAddReward}
                            onResetScore={handleResetScore}
                        />
                    </div>
                  )}

                  {activeTab === 'chores' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-[#4cc9f0] pl-2 opacity-80">{selectedUser.name} 的任务</h3>
                        <ChoreList 
                            chores={selectedUser.chores || []} 
                            mode="parent" 
                            onAction={handleDirectComplete} 
                            onDelete={handleDeleteChore} 
                        />
                    </div>
                  )}
                  
                  {activeTab === 'rewards' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-[#ef476f] pl-2 opacity-80">{selectedUser.name} 的礼物</h3>
                        <RewardList 
                            rewards={selectedUser.rewards || []} 
                            userScore={selectedUser.score}
                            onRedeem={handleDirectRedeem}
                            onDelete={handleDeleteReward} 
                        />
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-[#3a86ff] pl-2 opacity-80">{selectedUser.name} 的记录</h3>
                        <HistoryList
                            userId={selectedUser.id}
                            inventory={selectedUser.inventory}
                            onUseReward={handleUseReward}
                        />
                    </div>
                  )}
                </div>

                {/* Bottom Navigation */}
                <BottomNav 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                    mode="parent"
                    pendingCount={pendingActions.length}
                />
              </>
            )}
          </>
        ) : (
           <div className="text-center py-10">
             <div className="text-6xl mb-4">👋</div>
             <h2 className="text-2xl font-bold text-gray-600 mb-4">欢迎开始！</h2>
             <p className="text-gray-400 mb-6">先添加一个宝贝吧</p>
             <button 
                onClick={() => setShowAddUserModal(true)}
                className="w-full rounded-2xl bg-gradient-to-br from-[#a8edea] to-[#fed6e3] py-4 text-xl font-bold text-gray-800 transition-all hover:scale-105 shadow-md"
             >
                👶 添加宝贝
             </button>
           </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`待审核 (${pendingActions.length})`}
      >
        <div className="min-h-[200px]">
            <PendingList 
                pendingActions={pendingActions}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
      </Modal>

      {/* Generic Confirmation Modal */}
      <Modal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        title={confirmState.title}
      >
        <div className="space-y-4 text-center">
            {confirmState.emoji && <div className="text-6xl mb-4">{confirmState.emoji}</div>}
            <p className="text-xl font-bold text-gray-700">
                {confirmState.message}
            </p>
            
            <div className="flex flex-col gap-3 pt-4">
                {confirmState.options ? (
                    <>
                        {confirmState.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleConfirmAction(opt.action)}
                                className={`w-full rounded-xl py-4 font-bold text-white shadow-md active:scale-95 transition-transform ${opt.color}`}
                            >
                                {opt.text}
                            </button>
                        ))}
                        <button
                            onClick={closeConfirm}
                            className="w-full rounded-xl bg-gray-100 py-4 font-bold text-gray-500 active:scale-95 transition-transform"
                        >
                            取消
                        </button>
                    </>
                ) : (
                    <div className="flex gap-4">
                        <button
                            onClick={closeConfirm}
                            className="flex-1 rounded-xl bg-gray-100 py-4 font-bold text-gray-500 active:scale-95 transition-transform"
                        >
                            取消
                        </button>
                        <button
                            onClick={() => handleConfirmAction()}
                            className={`flex-1 rounded-xl py-4 font-bold text-white shadow-lg active:scale-95 transition-transform ${confirmState.confirmColor}`}
                        >
                            {confirmState.confirmText}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </Modal>

      {/* Add User Modal */}
      <Modal 
        isOpen={showAddUserModal} 
        onClose={() => setShowAddUserModal(false)}
        title="➕ 添加家庭成员"
      >
        <div className="space-y-4">
          {/* Role Selection */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
             <button 
                onClick={() => setNewUserRole('CHILD')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${newUserRole === 'CHILD' ? 'bg-white text-[#ff6b9d] shadow-sm' : 'text-gray-400'}`}
             >
                👶 宝贝
             </button>
             <button 
                onClick={() => setNewUserRole('PARENT')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${newUserRole === 'PARENT' ? 'bg-white text-[#4cc9f0] shadow-sm' : 'text-gray-400'}`}
             >
                👨‍👩‍👧‍👦 家长
             </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
                {newUserRole === 'CHILD' ? '宝贝名字：' : '家长名字：'}
            </label>
            <input 
              type="text" 
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="例如：小明"
              className="w-full rounded-xl border-2 border-gray-200 p-3 outline-none focus:border-[#ff6b9d]"
            />
            <p className="mt-2 text-xs text-gray-400">
                我们会自动为{newUserRole === 'CHILD' ? '宝贝' : '家庭成员'}创建账号，默认密码为 <span className="font-bold">123456</span>。
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <button 
              onClick={() => setShowAddUserModal(false)}
              className="flex-1 rounded-xl bg-gray-200 py-3 font-bold text-gray-700"
            >
              取消
            </button>
            <button 
              onClick={handleAddUser}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#f093fb] to-[#f5576c] py-3 font-bold text-white"
            >
              添加
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Child Profile Modal */}
      <EditChildProfile
        isOpen={showEditChildModal}
        onClose={() => setShowEditChildModal(false)}
        child={editingChild}
        onSave={handleSaveChildInfo}
        onResetPassword={handleResetChildPassword}
        showAlert={showAlert}
      />

      {/* Global Alert */}
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

export default ParentDashboard;
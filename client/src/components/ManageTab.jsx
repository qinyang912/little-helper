import { useState } from 'react';
import Modal from './Modal';
import EmojiPicker from './EmojiPicker';
import FamilyMembersList from './FamilyMembersList';
import { Gift, RotateCcw, ClipboardList } from 'lucide-react';

const choreEmojis = [
  '🧹', '🍽️', '🗑️', '🌱', '📚', '👕', '🧺', '🪴', '🧽', '🧴', '🛏️', '🪟',
  '🧸', '🪀', '🎲', '🧩', '👟', '👞', '🧤', '🧦', '🥤', '🍴', '🥄', '🪣',
  '🛁', '🚿', '🚽', '🪞', '🛋️', '🪑', '🛒', '📦', '🎒', '🖼️', '🕰️', '🫧',
  '✏️', '📝', '📖', '📕', '📔', '📓', '📒', '🖊️', '🖍️', '✂️', '📐', '📏',
  '🎓', '🏫', '🧮', '🖌️', '🎨', '📊', '📈', '🧪', '🔬', '🌍', '🗺️', '📌'
];

const rewardEmojis = [
  '🍦', '🎮', '🎬', '🎁', '🍕', '🍰', '🎨', '⚽', '🎪', '🎯', '🎸', '📱',
  '🍿', '🍭', '🍬', '🍫', '🧁', '🍩', '🎂', '🥤', '🧃', '🍌', '🍎', '🍓',
  '🎈', '🎉', '🎊', '🏀', '🎾', '🏐', '🎱', '🛴', '🛹', '🚲', '🎢', '🎡',
  '📺', '💻', '⌚', '📷', '🎧', '🎤', '🎹', '🎺', '🎻', '🥁', '🎭', '🎪',
  '💰', '💵', '💴', '💶', '💷', '💸', '🪙'
];

const ManageTab = ({
  users = [],
  currentUserId,
  onAddChore,
  onAddReward,
  onResetScore
}) => {
  const [activeModal, setActiveModal] = useState(null);
  const [targetUserId, setTargetUserId] = useState('ALL');

  const [choreName, setChoreName] = useState('');
  const [chorePoints, setChorePoints] = useState('');
  const [choreIcon, setChoreIcon] = useState(choreEmojis[0]);

  const [rewardName, setRewardName] = useState('');
  const [rewardCost, setRewardCost] = useState('');
  const [rewardIcon, setRewardIcon] = useState(rewardEmojis[0]);

  // 获取当前选中的宝贝
  const currentChild = users.find(u => u.id === currentUserId);

  // 当打开模态框时，重置目标用户选择
  const handleOpenModal = (modalType) => {
    if (currentUserId && users.some(u => u.id === currentUserId)) {
      setTargetUserId(currentUserId);
    } else {
      setTargetUserId('ALL');
    }
    setActiveModal(modalType);
  };

  const handleAddChore = () => {
    if (choreName && chorePoints) {
      onAddChore(
        { name: choreName, points: parseInt(chorePoints), icon: choreIcon },
        targetUserId
      );
      setChoreName('');
      setChorePoints('');
      setActiveModal(null);
    }
  };

  const handleAddReward = () => {
    if (rewardName && rewardCost) {
      onAddReward(
        { name: rewardName, cost: parseInt(rewardCost), icon: rewardIcon },
        targetUserId
      );
      setRewardName('');
      setRewardCost('');
      setActiveModal(null);
    }
  };

  const renderTargetSelector = () => {
    // 过滤掉家长，只保留孩子
    const childrenOnly = users.filter(u => u.role === 'CHILD');

    return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-gray-700 mb-2">分配给谁：</label>
      <select
        value={targetUserId}
        onChange={(e) => setTargetUserId(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
        className="w-full rounded-xl border-2 border-gray-200 p-3 outline-none focus:border-[#ff6b9d] bg-white font-bold text-base"
      >
        <option value="ALL">👨‍👩‍👧‍👦 所有宝贝 (默认)</option>
        {childrenOnly.map(user => (
          <option key={user.id} value={user.id}>
            👶 {user.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-400 mt-2">
        选择"所有宝贝"会为每个孩子都添加这个{activeModal === 'chore' ? '任务' : '奖励'}
      </p>
    </div>
    );
  };

  return (
    <div className="space-y-6 pb-6">
      {/* 宝贝信息概览卡片 */}
      {currentChild && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 border-2 border-purple-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {currentChild.name[0]}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">{currentChild.name} 的数据</h3>
              <p className="text-xs text-gray-500">当前管理的宝贝</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">✨</div>
              <div className="text-2xl font-black text-purple-600">{currentChild.score}</div>
              <div className="text-xs text-gray-500 font-bold">当前积分</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">📋</div>
              <div className="text-2xl font-black text-blue-600">{currentChild.chores?.length || 0}</div>
              <div className="text-xs text-gray-500 font-bold">可做任务</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">🎁</div>
              <div className="text-2xl font-black text-pink-600">{currentChild.rewards?.length || 0}</div>
              <div className="text-xs text-gray-500 font-bold">可换奖励</div>
            </div>
          </div>
        </div>
      )}

      {/* 快速操作区 */}
      <div className="space-y-3">
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide px-2">快速操作</h4>

        <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-100 mb-3">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-blue-800 mb-1">温馨提示</div>
              <div className="text-xs text-blue-600 leading-relaxed">
                添加任务或奖励时，可以选择"所有宝贝"来批量创建，节省时间哦！
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 添加家务 */}
          <button
            onClick={() => handleOpenModal('chore')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 p-4 shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-2">
                <ClipboardList className="text-white" size={24} />
              </div>
              <div className="text-white text-left">
                <div className="text-base font-black">添加任务</div>
                <div className="text-xs opacity-90">创建新的家务</div>
              </div>
            </div>
          </button>

          {/* 添加奖励 */}
          <button
            onClick={() => handleOpenModal('reward')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 p-4 shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-2">
                <Gift className="text-white" size={24} />
              </div>
              <div className="text-white text-left">
                <div className="text-base font-black">添加奖励</div>
                <div className="text-xs opacity-90">创建新的礼物</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 高级管理区 */}
      <div className="space-y-3">
        <FamilyMembersList users={users} />

        {/* 重置积分 */}
        <button
          onClick={onResetScore}
          className="w-full group relative overflow-hidden rounded-2xl bg-white border-2 border-orange-200 p-4 shadow-sm hover:shadow-md active:scale-98 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-400 shadow-md">
              <RotateCcw className="text-white" size={20} />
            </div>
            <div className="flex-1 text-left">
              <div className="text-base font-black text-gray-800">重置积分</div>
              <div className="text-xs text-gray-500">清空当前宝贝的所有星星</div>
            </div>
            <div className="text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* 批量管理提示 */}
      </div>

      {/* 添加家务模态框 */}
      <Modal
        isOpen={activeModal === 'chore'}
        onClose={() => setActiveModal(null)}
        title="📋 添加新任务"
      >
        <div className="space-y-4">
          {renderTargetSelector()}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">选择图标：</label>
            <EmojiPicker
              emojis={choreEmojis}
              selected={choreIcon}
              onSelect={setChoreIcon}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">任务名称：</label>
            <input
              type="text"
              value={choreName}
              onChange={(e) => setChoreName(e.target.value)}
              placeholder="例如：整理书桌"
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-base outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">奖励积分：</label>
            <div className="relative">
              <input
                type="number"
                value={chorePoints}
                onChange={(e) => setChorePoints(e.target.value)}
                placeholder="10"
                min="1"
                className="w-full rounded-xl border-2 border-gray-200 p-3 pr-12 text-base outline-none focus:border-blue-400 transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 text-xl">
                ⭐
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">完成这个任务能获得多少星星</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleAddChore}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-bold text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              创建任务
            </button>
          </div>
        </div>
      </Modal>

      {/* 添加奖励模态框 */}
      <Modal
        isOpen={activeModal === 'reward'}
        onClose={() => setActiveModal(null)}
        title="🎁 添加新奖励"
      >
        <div className="space-y-4">
          {renderTargetSelector()}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">选择图标：</label>
            <EmojiPicker
              emojis={rewardEmojis}
              selected={rewardIcon}
              onSelect={setRewardIcon}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">奖励名称：</label>
            <input
              type="text"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              placeholder="例如：看30分钟动画片"
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-base outline-none focus:border-pink-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">所需积分：</label>
            <div className="relative">
              <input
                type="number"
                value={rewardCost}
                onChange={(e) => setRewardCost(e.target.value)}
                placeholder="20"
                min="1"
                className="w-full rounded-xl border-2 border-gray-200 p-3 pr-12 text-base outline-none focus:border-pink-400 transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 text-xl">
                ⭐
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">兑换这个奖励需要多少星星</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleAddReward}
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-3 font-bold text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              创建奖励
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageTab;

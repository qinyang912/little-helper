import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { User, Calendar, Users, Lock, KeyRound } from 'lucide-react';

const EditChildProfile = ({ isOpen, onClose, child, onSave, onResetPassword, showAlert }) => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (child) {
      setFormData({
        name: child.name || '',
        birthDate: child.birthDate ? child.birthDate.split('T')[0] : '',
        gender: child.gender || '',
      });
    }
  }, [child]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showAlert({
        type: 'error',
        title: '错误',
        message: '宝贝名字不能为空',
        actionLabel: '好的'
      });
      return;
    }

    try {
      await onSave(formData);
      showAlert({
        type: 'success',
        title: '保存成功！',
        message: '宝贝信息已更新',
        actionLabel: '好的'
      });
      onClose();
    } catch (error) {
      showAlert({
        type: 'error',
        title: '保存失败',
        message: '出了点小问题，请稍后再试',
        actionLabel: '好的'
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert({
        type: 'error',
        title: '错误',
        message: '请填写新密码和确认密码',
        actionLabel: '好的'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({
        type: 'error',
        title: '错误',
        message: '两次输入的密码不一致',
        actionLabel: '好的'
      });
      return;
    }

    if (newPassword.length < 6) {
      showAlert({
        type: 'error',
        title: '错误',
        message: '密码长度至少为 6 位',
        actionLabel: '好的'
      });
      return;
    }

    try {
      await onResetPassword(newPassword);
      showAlert({
        type: 'success',
        title: '重置成功！',
        message: `新密码已设置为：${newPassword}\n请记住这个密码`,
        actionLabel: '记住了'
      });
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordReset(false);
    } catch (error) {
      showAlert({
        type: 'error',
        title: '重置失败',
        message: '出了点小问题，请稍后再试',
        actionLabel: '好的'
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`✏️ 编辑 ${child?.name} 的信息`}
    >
      <div className="space-y-4">
        {/* Login Account (Read-only) */}
        <div className="bg-blue-50 rounded-xl p-3 border-2 border-blue-100">
          <label className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
            <KeyRound size={14} />
            登录账号
          </label>
          <div className="text-lg font-bold text-blue-800">
            {child?.username || ''}
          </div>
          <p className="text-xs text-blue-500 mt-1">
            此账号不可修改，用于登录系统
          </p>
        </div>

        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <User size={16} />
            宝贝名字
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="例如：小明"
            className="w-full rounded-xl border-2 border-gray-200 p-3 outline-none focus:border-[#ff6b9d] transition-colors"
          />
        </div>

        {/* Birth Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Calendar size={16} />
            出生年月
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
            className="w-full rounded-xl border-2 border-gray-200 p-3 outline-none focus:border-[#ff6b9d] transition-colors"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Users size={16} />
            性别
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({...formData, gender: '男'})}
              className={`flex-1 rounded-xl py-3 font-bold transition-all ${
                formData.gender === '男'
                  ? 'bg-blue-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              👦 男生
            </button>
            <button
              onClick={() => setFormData({...formData, gender: '女'})}
              className={`flex-1 rounded-xl py-3 font-bold transition-all ${
                formData.gender === '女'
                  ? 'bg-pink-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              👧 女生
            </button>
          </div>
        </div>

        {/* Password Reset Section */}
        <div className="border-t-2 border-gray-100 pt-4">
          <button
            onClick={() => setShowPasswordReset(!showPasswordReset)}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#ff6b9d] transition-colors mb-3"
          >
            <Lock size={16} />
            {showPasswordReset ? '取消重置密码' : '重置登录密码'}
          </button>

          {showPasswordReset && (
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="至少 6 位"
                  className="w-full rounded-lg border-2 border-gray-200 p-2 text-sm outline-none focus:border-[#ff6b9d]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">确认密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再输入一次"
                  className="w-full rounded-lg border-2 border-gray-200 p-2 text-sm outline-none focus:border-[#ff6b9d]"
                />
              </div>
              <button
                onClick={handlePasswordReset}
                className="w-full rounded-lg bg-orange-500 py-2 text-sm font-bold text-white active:scale-95 transition-transform"
              >
                确认重置密码
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-200 py-3 font-bold text-gray-700 active:scale-95 transition-transform"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#f093fb] to-[#f5576c] py-3 font-bold text-white active:scale-95 transition-transform shadow-md"
          >
            保存修改
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditChildProfile;

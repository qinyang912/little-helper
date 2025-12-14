import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.register(formData.username, formData.password, formData.name);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user.id);
      navigate('/parent');
    } catch (err) {
      setError(err.response?.data?.error || '注册失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-xl border-4 border-white">
        <h1 className="text-3xl font-black text-center text-[#06d6a0] mb-8">
          家长注册 📝
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-500 rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-500 font-bold mb-2 ml-2">您的昵称</label>
            <input
              type="text"
              required
              className="w-full h-14 px-6 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-[#06d6a0] focus:bg-white transition-all outline-none font-bold text-lg"
              placeholder="例如：超人爸爸"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-500 font-bold mb-2 ml-2">账号</label>
            <input
              type="text"
              required
              className="w-full h-14 px-6 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-[#06d6a0] focus:bg-white transition-all outline-none font-bold text-lg"
              placeholder="设置登录账号"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-500 font-bold mb-2 ml-2">密码</label>
            <input
              type="password"
              required
              className="w-full h-14 px-6 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-[#06d6a0] focus:bg-white transition-all outline-none font-bold text-lg"
              placeholder="设置密码"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-[#06d6a0] text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform"
          >
            立即注册
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-gray-400 font-bold hover:text-[#06d6a0]">
            已有账号？去登录 👉
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

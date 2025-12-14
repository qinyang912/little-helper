import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.login(formData.username, formData.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user.id);
      
      if (data.user.role === 'PARENT') {
        navigate('/parent');
      } else {
        navigate('/child');
      }
    } catch (err) {
      setError(err.response?.data?.error || '登录失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-xl border-4 border-white">
        <h1 className="text-3xl font-black text-center text-[#ff9e00] mb-8">
          欢迎回来! 👋
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-500 rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-500 font-bold mb-2 ml-2">账号</label>
            <input
              type="text"
              required
              className="w-full h-14 px-6 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-[#ff9e00] focus:bg-white transition-all outline-none font-bold text-lg"
              placeholder="请输入账号"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-500 font-bold mb-2 ml-2">密码</label>
            <input
              type="password"
              required
              className="w-full h-14 px-6 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-[#ff9e00] focus:bg-white transition-all outline-none font-bold text-lg"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-[#ff9e00] text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform"
          >
            登 录
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/register" className="text-gray-400 font-bold hover:text-[#ff9e00]">
            我是新家长，去注册 👉
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

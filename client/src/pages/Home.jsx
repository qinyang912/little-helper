import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8">
      <h1 className="text-5xl font-black text-[#ff9e00] text-center drop-shadow-[0_4px_0_rgba(255,255,255,1)] mb-8" 
          style={{ WebkitTextStroke: '2px white' }}>
        小帮手积分
      </h1>

      <div className="grid gap-6 md:grid-cols-2 w-full max-w-4xl">
        {/* 宝贝入口 */}
        <button
          onClick={() => navigate('/child')}
          className="group relative flex flex-col items-center p-8 rounded-[40px] bg-white border-[6px] border-[#06d6a0] border-b-[12px] active:border-b-[6px] active:translate-y-2 transition-all hover:-translate-y-1"
        >
          <div className="text-[120px] mb-4 transition-transform group-hover:scale-110 group-hover:rotate-12">
            👶
          </div>
          <h2 className="text-4xl font-black text-[#06d6a0] mb-2">我是宝贝</h2>
          <p className="text-xl text-gray-400 font-bold">做家务 • 赚星星 • 换礼物</p>
        </button>

        {/* 家长入口 */}
        <button
          onClick={() => navigate('/parent')}
          className="group relative flex flex-col items-center p-8 rounded-[40px] bg-white border-[6px] border-[#ff9e00] border-b-[12px] active:border-b-[6px] active:translate-y-2 transition-all hover:-translate-y-1"
        >
          <div className="text-[120px] mb-4 transition-transform group-hover:scale-110 group-hover:-rotate-12">
            👨‍👩‍👧
          </div>
          <h2 className="text-4xl font-black text-[#ff9e00] mb-2">我是家长</h2>
          <p className="text-xl text-gray-400 font-bold">审核任务 • 管理设置</p>
        </button>
      </div>

      <div className="text-gray-400 font-medium mt-10">
        让做家务变得像游戏一样好玩！✨
      </div>
    </div>
  );
};

export default Home;

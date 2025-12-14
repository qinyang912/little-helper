import React, { useEffect, useState } from 'react';

const ScoreDisplay = ({ score, userName }) => {
  const [animate, setAnimate] = useState(false);

  // 当积分变化时触发动画
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative mx-auto mb-8 max-w-sm">
      {/* 背景光晕 */}
      <div className="absolute inset-0 -top-4 rounded-full bg-yellow-400 blur-2xl opacity-20 animate-pulse"></div>
      
      <div className="relative flex flex-col items-center justify-center rounded-[40px] border-[6px] border-white bg-gradient-to-b from-[#ffd166] to-[#ff9e00] p-6 shadow-[0_10px_0_rgba(255,160,0,0.3)] text-white">
        
        {/* 用户名胶囊 */}
        <div className="absolute -top-5 rounded-full border-4 border-white bg-[#06d6a0] px-6 py-2 text-xl font-bold shadow-md">
          {userName || '宝贝'}
        </div>

        <div className="flex items-center gap-4 mt-2">
          {/* 星星图标 */}
          <div className="animate-bounce-slow text-7xl drop-shadow-md filter">
            ⭐
          </div>
          
          {/* 数字 */}
          <div className={`text-8xl font-black tracking-wider transition-transform duration-300 ${animate ? 'scale-125' : 'scale-100'}`}
               style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
            {score}
          </div>
        </div>

        <div className="mt-2 text-xl font-bold opacity-90">星星积分</div>
      </div>
    </div>
  );
};

export default ScoreDisplay;
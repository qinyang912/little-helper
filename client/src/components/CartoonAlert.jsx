import React from 'react';

const CartoonAlert = ({ isOpen, type, title, message, onClose, onAction, actionLabel }) => {
  if (!isOpen) return null;

  // 根据类型配置不同的样式和图标
  const config = {
    chore: {
      color: 'bg-[#4cc9f0]',
      border: 'border-[#4cc9f0]',
      icon: '📨',
      btnColor: 'bg-[#4cc9f0]',
      btnBorder: 'border-[#00b4d8]',
      animation: 'animate-bounce'
    },
    reward: {
      color: 'bg-[#ef476f]',
      border: 'border-[#ef476f]',
      icon: '🎁',
      btnColor: 'bg-[#ef476f]',
      btnBorder: 'border-[#d90429]',
      animation: 'animate-pulse'
    },
    use: {
      color: 'bg-[#ffd166]',
      border: 'border-[#ffd166]',
      icon: '✨',
      btnColor: 'bg-[#ffd166]',
      btnBorder: 'border-[#fb8500]',
      animation: 'animate-spin-slow'
    },
    error: {
      color: 'bg-[#ef233c]',
      border: 'border-[#ef233c]',
      icon: '🙅',
      btnColor: 'bg-[#ef233c]',
      btnBorder: 'border-[#d90429]',
      animation: 'animate-bounce'
    },
    info: {
      color: 'bg-[#8338ec]',
      border: 'border-[#8338ec]',
      icon: '💡',
      btnColor: 'bg-[#8338ec]',
      btnBorder: 'border-[#6a28d9]',
      animation: 'animate-pulse'
    },
    success: {
      color: 'bg-[#06d6a0]',
      border: 'border-[#06d6a0]',
      icon: '✅',
      btnColor: 'bg-[#06d6a0]',
      btnBorder: 'border-[#05b584]',
      animation: 'animate-bounce'
    }
  };

  const style = config[type] || config.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`
        relative w-full max-w-sm rounded-[40px] bg-white p-6 text-center shadow-2xl 
        border-[6px] ${style.border} transform transition-all animate-pop-up
      `}>
        {/* 顶部装饰光环 */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full ${style.color} blur-xl opacity-30`}></div>

        {/* 巨大的动态图标 */}
        <div className={`
          relative mx-auto -mt-16 mb-4 flex h-28 w-28 items-center justify-center 
          rounded-full border-8 border-white ${style.color} shadow-lg text-6xl
        `}>
          <span className={style.animation}>{style.icon}</span>
        </div>

        <h2 className={`text-3xl font-black mb-2 text-gray-800`}>
          {title}
        </h2>
        
        <p className="text-xl text-gray-500 font-bold mb-8 leading-relaxed whitespace-pre-wrap">
          {message}
        </p>

        <button
          onClick={() => {
            onClose();
            if (onAction) onAction();
          }}
          className={`
            w-full rounded-2xl border-b-[6px] py-4 text-2xl font-black text-white transition-all
            ${style.btnColor} ${style.btnBorder}
            active:border-b-0 active:translate-y-2 hover:brightness-110
          `}
        >
          {actionLabel || '好哒! 👌'}
        </button>
      </div>

      <style>{`
        @keyframes pop-up {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CartoonAlert;
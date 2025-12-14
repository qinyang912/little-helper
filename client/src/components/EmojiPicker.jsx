import React from 'react';

const EmojiPicker = ({ emojis, selected, onSelect }) => {
  return (
    <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-xl">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`
            text-3xl p-2 rounded-lg border-2 transition-all
            ${selected === emoji 
              ? 'border-[#ff6b9d] bg-[#ffe0eb]' 
              : 'border-transparent hover:bg-gray-100'
            }
          `}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;

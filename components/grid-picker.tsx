'use client';

import { useState } from 'react';

interface GridPickerProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  customValues?: number[];
}

export function GridPicker({ value, onChange, label, unit = '', customValues = [] }: GridPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  
  const handleSelect = (val: number) => {
    setSelectedValue(val);
  };
  
  const handleConfirm = () => {
    onChange(selectedValue);
    setIsOpen(false);
  };
  
  const handleCancel = () => {
    setSelectedValue(value);
    setIsOpen(false);
  };
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 bg-white/5 hover:bg-white/10 rounded-2xl h-32 flex flex-col items-center justify-center border border-white/10 transition-all active:scale-95"
      >
        <div className="text-sm opacity-70 mb-2">{label}</div>
        <div className="text-5xl font-mono font-bold">{value}{unit}</div>
      </button>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50" 
          onClick={handleCancel}
        >
          <div 
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-6 text-center">{label}を選択</h3>
            
            {/* グリッド */}
            <div className="flex-1 overflow-y-auto mb-6 scrollbar-hide">
              <div className="grid grid-cols-4 gap-3">
                {customValues.map((val, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(val)}
                    className={`
                      h-16 rounded-xl font-mono font-bold text-xl
                      transition-all active:scale-95
                      ${Math.abs(val - selectedValue) < 0.01
                        ? 'bg-green-500 text-white scale-105'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }
                    `}
                  >
                    {val}{unit}
                  </button>
                ))}
              </div>
            </div>
            
            {/* ボタン */}
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-4 border border-white/10 transition-all active:scale-95"
              >
                <span className="text-lg font-bold">キャンセル</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-500 hover:bg-green-600 rounded-xl py-4 transition-all active:scale-95"
              >
                <span className="text-lg font-bold text-white">決定</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

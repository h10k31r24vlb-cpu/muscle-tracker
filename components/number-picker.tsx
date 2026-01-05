'use client';

import { useEffect, useRef, useState } from 'react';

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  unit?: string;
}

export function NumberPicker({ value, onChange, min, max, step, label, unit = '' }: NumberPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 選択可能な値のリストを生成
  const values: number[] = [];
  for (let i = min; i <= max; i += step) {
    values.push(i);
  }
  
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const index = values.findIndex(v => v === selectedValue);
      if (index !== -1) {
        const itemHeight = 60;
        scrollRef.current.scrollTop = index * itemHeight - itemHeight * 2;
      }
    }
  }, [isOpen, selectedValue, values]);
  
  const handleConfirm = () => {
    onChange(selectedValue);
    setIsOpen(false);
  };
  
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const itemHeight = 60;
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
    setSelectedValue(values[clampedIndex]);
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6 text-center">{label}を選択</h3>
            
            <div className="relative h-[300px] overflow-hidden mb-6">
              {/* 選択インジケーター */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[60px] bg-green-500/20 border-y-2 border-green-500 pointer-events-none z-10" />
              
              {/* スクロール可能なリスト */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                style={{ scrollSnapType: 'y mandatory' }}
              >
                {/* 上部のパディング */}
                <div className="h-[120px]" />
                
                {values.map((v, idx) => (
                  <div
                    key={idx}
                    className="h-[60px] flex items-center justify-center text-4xl font-mono font-bold snap-center"
                    style={{
                      opacity: v === selectedValue ? 1 : 0.3,
                      transform: v === selectedValue ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {v}{unit}
                  </div>
                ))}
                
                {/* 下部のパディング */}
                <div className="h-[120px]" />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setIsOpen(false)}
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

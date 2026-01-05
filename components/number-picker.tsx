'use client';

import { useEffect, useRef, useState } from 'react';

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  customValues?: number[];
}

export function NumberPicker({ value, onChange, min, max, step, label, unit = '', customValues }: NumberPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoScrollingRef = useRef(false);
  
  // 選択可能な値のリストを生成
  const values: number[] = customValues || (() => {
    const vals: number[] = [];
    if (step) {
      for (let i = min; i <= max; i += step) {
        vals.push(Number(i.toFixed(1)));
      }
    }
    return vals;
  })();
  
  // モーダルを開いた時に現在の値にスクロール
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      // 現在の値に最も近い値を見つける
      let closestIndex = 0;
      let minDiff = Math.abs(values[0] - value);
      
      for (let i = 1; i < values.length; i++) {
        const diff = Math.abs(values[i] - value);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }
      
      setSelectedValue(values[closestIndex]);
      
      // 初期スクロール位置を設定
      isAutoScrollingRef.current = true;
      const itemHeight = 60;
      scrollRef.current.scrollTop = closestIndex * itemHeight;
      
      // 少し遅延してから自動スクロールフラグをオフ
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    }
  }, [isOpen]);
  
  const handleScroll = () => {
    if (!scrollRef.current || isAutoScrollingRef.current) return;
    
    // スクロール中のタイムアウトをクリア
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    const itemHeight = 60;
    const scrollTop = scrollRef.current.scrollTop;
    const centerOffset = 120; // 上部パディング
    const adjustedScrollTop = scrollTop + centerOffset;
    const index = Math.round(adjustedScrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
    
    setSelectedValue(values[clampedIndex]);
    
    // スクロール終了後にスナップ（ユーザーがスクロールを止めた後のみ）
    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollRef.current && !isAutoScrollingRef.current) {
        const targetScrollTop = clampedIndex * itemHeight;
        const currentScrollTop = scrollRef.current.scrollTop;
        
        // 既に正しい位置にある場合はスナップしない
        if (Math.abs(currentScrollTop - targetScrollTop) > 5) {
          isAutoScrollingRef.current = true;
          scrollRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
          
          // スムーズスクロール完了後にフラグをオフ
          setTimeout(() => {
            isAutoScrollingRef.current = false;
          }, 300);
        }
      }
    }, 150);
  };
  
  const handleConfirm = () => {
    onChange(selectedValue);
    setIsOpen(false);
  };
  
  const handleCancel = () => {
    setSelectedValue(value); // 元の値に戻す
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
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-6 text-center">{label}を選択</h3>
            
            <div className="relative h-[300px] overflow-hidden mb-6">
              {/* 選択インジケーター */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[60px] bg-green-500/20 border-y-2 border-green-500 pointer-events-none z-10" />
              
              {/* スクロール可能なリスト */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {/* 上部のパディング */}
                <div className="h-[120px]" />
                
                {values.map((v, idx) => (
                  <div
                    key={`${v}-${idx}`}
                    className="h-[60px] flex items-center justify-center text-4xl font-mono font-bold"
                    style={{
                      opacity: Math.abs(v - selectedValue) < 0.01 ? 1 : 0.3,
                      transform: Math.abs(v - selectedValue) < 0.01 ? 'scale(1.2)' : 'scale(1)',
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

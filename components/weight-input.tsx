'use client';

import { NumberPicker } from './number-picker';

interface WeightInputProps {
  weight: number;
  onWeightChange: (weight: number) => void;
}

export function WeightInput({ weight, onWeightChange }: WeightInputProps) {
  // スマート刻み幅: 0-20kg は 1kg刻み、20kg以上は 2.5kg刻み
  const getStep = (currentWeight: number) => {
    return currentWeight < 20 ? 1 : 2.5;
  };
  
  const increment = () => {
    const step = getStep(weight);
    onWeightChange(weight + step);
  };
  
  const decrement = () => {
    const step = getStep(weight);
    const newWeight = weight - step;
    if (newWeight >= 0) {
      onWeightChange(newWeight);
    }
  };
  
  // ピッカー用の値リストを生成
  const generateWeightValues = () => {
    const values: number[] = [];
    // 0-20kg: 1kg刻み
    for (let i = 0; i <= 20; i += 1) {
      values.push(i);
    }
    // 20kg以上: 2.5kg刻み
    for (let i = 22.5; i <= 200; i += 2.5) {
      values.push(i);
    }
    return values;
  };
  
  const weightValues = generateWeightValues();
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={decrement}
          className="w-20 h-20 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/10 transition-all active:scale-95"
        >
          −
        </button>
        
        <NumberPicker
          value={weight}
          onChange={onWeightChange}
          min={0}
          max={200}
          step={1}
          label="重量"
          unit="kg"
        />
        
        <button
          onClick={increment}
          className="w-20 h-20 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/10 transition-all active:scale-95"
        >
          +
        </button>
      </div>
      
      <div className="text-center text-sm opacity-70">
        {weight < 20 ? '1kg刻みで調整' : '2.5kg刻みで調整'}
      </div>
    </div>
  );
}

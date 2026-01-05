'use client';

import { useState, useEffect } from 'react';
import { useWorkout } from '@/lib/workout-context';
import { useSessionTimer } from '@/hooks/use-session-timer';
import { useIntervalTimer } from '@/hooks/use-interval-timer';
import { getAllExercises, addCustomExercise, deleteCustomExercise, BODY_PARTS, type BodyPart } from '@/constants/exercises';
import { GridPicker } from '@/components/grid-picker';
import { registerServiceWorker, requestNotificationPermission } from '@/lib/pwa-utils';


export default function Home() {
  const { state, dispatch } = useWorkout();
  const { elapsed, formatTime } = useSessionTimer(state.sessionData.start);
  const intervalTimer = useIntervalTimer();
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExercisePart, setNewExercisePart] = useState<BodyPart>(BODY_PARTS.CHEST);
  const [exercises, setExercises] = useState(getAllExercises());
  const [useShortcut, setUseShortcut] = useState(false);

  // localStorageのキー
  const WORKOUT_DATA_KEY = 'muscle_tracker_workout_data';
  const USE_SHORTCUT_KEY = 'muscle_tracker_use_shortcut';

  // PWA初期化：Service Worker登録と通知権限リクエスト
  useEffect(() => {
    registerServiceWorker();
    // ワークアウト開始時に通知権限をリクエスト
    if (state.status === 'ACTIVE') {
      requestNotificationPermission();
    }
  }, [state.status]);

  // アプリ起動時にlocalStorageからデータを復元
  useEffect(() => {
    const savedData = localStorage.getItem(WORKOUT_DATA_KEY);
    const savedUseShortcut = localStorage.getItem(USE_SHORTCUT_KEY);
    
    if (savedUseShortcut) {
      setUseShortcut(savedUseShortcut === 'true');
    }
    
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        // IDLEやFINISHED状態は復元しない
        if (data.status === 'ACTIVE' || data.status === 'REST') {
          dispatch({ type: 'RESTORE_DATA', data });
        }
      } catch (error) {
        console.error('Failed to restore workout data:', error);
      }
    }
  }, []);

  // ワークアウトデータがlocalStorageに保存
  useEffect(() => {
    if (state.status === 'ACTIVE' || state.status === 'REST') {
      localStorage.setItem(WORKOUT_DATA_KEY, JSON.stringify(state));
    } else if (state.status === 'IDLE' || state.status === 'FINISHED') {
      // ワークアウト終了時はデータを削除
      localStorage.removeItem(WORKOUT_DATA_KEY);
    }
  }, [state]);

  const startWorkout = () => {
    dispatch({ type: 'START_WORKOUT' });
  };

  const logSet = () => {
    const newLog = {
      id: crypto.randomUUID(),
      exerciseId: state.currentExercise.id,
      exerciseName: state.currentExercise.name,
      bodyPart: state.currentExercise.part,
      weight: state.weight,
      reps: state.reps,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'LOG_SET', log: newLog });
    dispatch({ type: 'START_REST' });
    
    if (useShortcut) {
      // ショートカットを起動（2分タイマー）
      // 注意: ショートカット名はユーザーが設定した名前に合わせる
      window.location.href = 'shortcuts://run-shortcut?name=筋トレタイマー';
    } else {
      // 通常のインターバルタイマー
      intervalTimer.start(90);
    }
  };

  const skipRest = () => {
    intervalTimer.stop();
    dispatch({ type: 'END_REST' });
  };

  const handleFinishClick = () => {
    setShowFinishModal(true);
  };

  const confirmFinishWorkout = async () => {
    setShowFinishModal(false);
    dispatch({ type: 'SET_SAVING', isSaving: true });
    
    const endTime = Date.now();
    
    try {
      const logs = state.logs.map(log => ({
        date: log.timestamp,
        menu: log.exerciseName,
        bodyPart: log.bodyPart,
        weight: log.weight,
        reps: log.reps,
      }));
      
      const session = {
        date: new Date(state.sessionData.start!).toISOString().split('T')[0],
        startTime: new Date(state.sessionData.start!).toISOString(),
        endTime: new Date(endTime).toISOString(),
        durationMin: Math.ceil((endTime - state.sessionData.start!) / 1000 / 60),
      };
      
      // API Routeを経由してNotionに送信
      const response = await fetch('/api/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs, session }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync to Notion');
      }
    } catch (error) {
      console.error('Failed to sync to Notion:', error);
      alert('Notionへの送信に失敗しました。コンソールを確認してください。');
    }
    
    dispatch({ type: 'SET_SAVING', isSaving: false });
    dispatch({ type: 'FINISH_WORKOUT', endTime });
  };

  const resetWorkout = () => {
    dispatch({ type: 'RESET' });
  };

  const changeExercise = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      dispatch({ type: 'CHANGE_EXERCISE', exercise });
    }
    setShowExerciseModal(false);
  };

  const handleAddCustomExercise = () => {
    if (!newExerciseName.trim()) return;
    const newExercise = addCustomExercise(newExerciseName.trim(), newExercisePart);
    setExercises(getAllExercises());
    setNewExerciseName('');
    setNewExercisePart(BODY_PARTS.CHEST);
    setShowAddExerciseModal(false);
    // 新しい種目を自動選択
    dispatch({ type: 'CHANGE_EXERCISE', exercise: newExercise });
  };

  const copyLastSet = () => {
    const lastLog = state.logs.find(log => log.exerciseId === state.currentExercise.id);
    if (lastLog) {
      dispatch({ type: 'SET_WEIGHT', weight: lastLog.weight });
      dispatch({ type: 'SET_REPS', reps: lastLog.reps });
    }
  };

  const currentSetNumber = state.logs.filter(l => l.exerciseId === state.currentExercise.id).length + 1;

  // IDLE状態
  if (state.status === 'IDLE') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="mb-12 text-center">
            <div className="text-8xl mb-6">💪</div>
            <h1 className="text-5xl font-black mb-2">MUSCLE TRACKER</h1>
            <p className="text-lg opacity-70">今日の限界を超えろ</p>
          </div>
          <button
            onClick={startWorkout}
            className="w-full bg-green-500 hover:bg-green-600 rounded-3xl h-32 flex items-center justify-center shadow-lg transition-all active:scale-95"
          >
            <span className="text-3xl font-bold text-white">▶ トレーニング開始</span>
          </button>
        </div>
      </div>
    );
  }

  // FINISHED状態
  if (state.status === 'FINISHED') {
    const totalSets = state.logs.length;
    const duration = state.sessionData.end && state.sessionData.start 
      ? Math.floor((state.sessionData.end - state.sessionData.start) / 1000)
      : 0;

    // 種目ごとにグループ化
    const exerciseGroups = state.logs.reduce((groups, log) => {
      if (!groups[log.exerciseName]) {
        groups[log.exerciseName] = {
          name: log.exerciseName,
          part: log.bodyPart,
          sets: []
        };
      }
      groups[log.exerciseName].sets.push({ weight: log.weight, reps: log.reps });
      return groups;
    }, {} as Record<string, { name: string; part: string; sets: { weight: number; reps: number }[] }>);

    const exercises = Object.values(exerciseGroups);

    // 部位のアイコンマッピング
    const partIcons: Record<string, string> = {
      '胸': '💪',
      '背中': '🦾',
      '脚': '🦵',
      '肩': '🏋️',
      '腕': '💪',
      '腹筋': '🔥',
    };

    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">✅</div>
            <h2 className="text-4xl font-bold mb-2">お疲れ様でした!</h2>
            <p className="text-lg opacity-70 mb-4">データはNotionへ送信されました</p>
            
            <div className="flex justify-center gap-8 mb-8">
              <div>
                <div className="text-3xl font-mono font-bold">{formatTime(duration)}</div>
                <div className="text-sm opacity-70">総時間</div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold">{totalSets}</div>
                <div className="text-sm opacity-70">総セット数</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-6 text-center">今日のトレーニング</h3>
            <div className="space-y-6">
              {exercises.map((exercise, idx) => (
                <div key={idx} className="border-b border-white/10 last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{partIcons[exercise.part] || '💪'}</span>
                    <div>
                      <div className="text-2xl font-bold">{exercise.name}</div>
                      <div className="text-sm opacity-70">{exercise.part}</div>
                    </div>
                  </div>
                  <div className="space-y-2 pl-12">
                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0">
                        <span className="opacity-70">セット {setIdx + 1}</span>
                        <span className="text-xl font-mono font-bold">{set.weight}kg × {set.reps}回</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={resetWorkout}
            className="w-full bg-blue-500 hover:bg-blue-600 rounded-2xl h-16 flex items-center justify-center transition-all active:scale-95"
          >
            <span className="text-xl font-bold text-white">ホームに戻る</span>
          </button>
        </div>
      </div>
    );
  }

  // REST状態
  if (state.status === 'REST') {
    const progress = intervalTimer.totalTime > 0 ? intervalTimer.timeLeft / intervalTimer.totalTime : 0;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <p className="text-2xl opacity-70 mb-8">インターバル</p>
          
          <div className="mb-8">
            <div className="text-9xl font-bold text-blue-500">{intervalTimer.timeLeft}</div>
            <div className="text-3xl opacity-70 mt-2">秒</div>
          </div>

          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-12">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => intervalTimer.addTime(10)}
                className="flex-1 bg-white/5 hover:bg-white/10 rounded-2xl h-16 flex items-center justify-center border border-white/10 transition-all active:scale-95"
              >
                <span className="text-xl font-bold">+10秒</span>
              </button>
              <button
                onClick={() => intervalTimer.addTime(30)}
                className="flex-1 bg-white/5 hover:bg-white/10 rounded-2xl h-16 flex items-center justify-center border border-white/10 transition-all active:scale-95"
              >
                <span className="text-xl font-bold">+30秒</span>
              </button>
            </div>

            <button
              onClick={skipRest}
              className="w-full bg-green-500 hover:bg-green-600 rounded-2xl h-20 flex items-center justify-center transition-all active:scale-95"
            >
              <span className="text-2xl font-bold text-white">スキップして次へ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE状態
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-4xl font-bold">{formatTime(elapsed)}</div>
            <div className="text-sm opacity-70">セッション経過時間</div>
          </div>
          <button
            onClick={handleFinishClick}
            className="bg-red-500 hover:bg-red-600 rounded-xl px-8 py-4 transition-all active:scale-95"
          >
            <span className="text-lg font-bold text-white">終了</span>
          </button>
        </div>

        {/* 種目選択 */}
        <button
          onClick={() => setShowExerciseModal(true)}
          className="w-full bg-white/5 hover:bg-white/10 rounded-2xl p-6 mb-6 border border-white/10 text-left transition-all active:scale-95"
        >
          <div className="text-sm opacity-70 mb-1">{state.currentExercise.part}</div>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold">{state.currentExercise.name}</div>
            <div className="text-3xl opacity-70">▼</div>
          </div>
          <div className="text-sm opacity-70 mt-2">セット {currentSetNumber}</div>
        </button>

        {/* 入力フォーム */}
        <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
          <div className="mb-8">
            {/* 大きいボタン: 通常の刻み */}
            <div className="flex gap-4 mb-3">
              <button
                onClick={() => {
                  const vals: number[] = [];
                  for (let i = 0; i <= 20; i += 1) vals.push(i);
                  for (let i = 22.5; i <= 200; i += 2.5) vals.push(i);
                  
                  const currentIndex = vals.findIndex(v => Math.abs(v - state.weight) < 0.01);
                  if (currentIndex > 0) {
                    dispatch({ type: 'SET_WEIGHT', weight: vals[currentIndex - 1] });
                  } else if (currentIndex === -1 && state.weight > 0) {
                    const closest = vals.reduce((prev, curr) => 
                      Math.abs(curr - state.weight) < Math.abs(prev - state.weight) ? curr : prev
                    );
                    const closestIndex = vals.indexOf(closest);
                    if (closestIndex > 0) {
                      dispatch({ type: 'SET_WEIGHT', weight: vals[closestIndex - 1] });
                    }
                  }
                }}
                className="w-20 h-32 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/10 transition-all active:scale-95"
              >
                −
              </button>
              
              <GridPicker
                value={state.weight}
                onChange={(weight) => dispatch({ type: 'SET_WEIGHT', weight })}
                customValues={(() => {
                  const vals: number[] = [];
                  for (let i = 0; i <= 20; i += 1) {
                    vals.push(i);
                  }
                  for (let i = 22.5; i <= 200; i += 2.5) {
                    vals.push(i);
                  }
                  return vals;
                })()}
                label="重量"
                unit="kg"
              />
              
              <button
                onClick={() => {
                  const vals: number[] = [];
                  for (let i = 0; i <= 20; i += 1) vals.push(i);
                  for (let i = 22.5; i <= 200; i += 2.5) vals.push(i);
                  
                  const currentIndex = vals.findIndex(v => Math.abs(v - state.weight) < 0.01);
                  if (currentIndex !== -1 && currentIndex < vals.length - 1) {
                    dispatch({ type: 'SET_WEIGHT', weight: vals[currentIndex + 1] });
                  } else if (currentIndex === -1) {
                    const closest = vals.reduce((prev, curr) => 
                      Math.abs(curr - state.weight) < Math.abs(prev - state.weight) ? curr : prev
                    );
                    const closestIndex = vals.indexOf(closest);
                    if (closestIndex < vals.length - 1) {
                      dispatch({ type: 'SET_WEIGHT', weight: vals[closestIndex + 1] });
                    }
                  }
                }}
                className="w-20 h-32 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/10 transition-all active:scale-95"
              >
                +
              </button>
            </div>
            
            {/* 小さいボタン: 0.5kg刻み */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  const newWeight = Math.max(0, state.weight - 0.5);
                  dispatch({ type: 'SET_WEIGHT', weight: Number(newWeight.toFixed(1)) });
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10 transition-all active:scale-95"
              >
                -0.5kg
              </button>
              
              <div className="text-sm opacity-70 flex items-center px-4">
                {state.weight < 20 ? '1kg' : '2.5kg'}刻み / 0.5kg刻み
              </div>
              
              <button
                onClick={() => {
                  const newWeight = state.weight + 0.5;
                  dispatch({ type: 'SET_WEIGHT', weight: Number(newWeight.toFixed(1)) });
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10 transition-all active:scale-95"
              >
                +0.5kg
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => dispatch({ type: 'SET_REPS', reps: Math.max(1, state.reps - 1) })}
                className="w-20 h-32 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/10 transition-all active:scale-95"
              >
                −
              </button>
              
              <GridPicker
                value={state.reps}
                onChange={(reps) => dispatch({ type: 'SET_REPS', reps })}
                customValues={Array.from({ length: 50 }, (_, i) => i + 1)}
                label="回数"
                unit="回"
              />
              
              <button
                onClick={() => dispatch({ type: 'SET_REPS', reps: state.reps + 1 })}
                className="w-20 h-32 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/10 transition-all active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {state.logs.some(log => log.exerciseId === state.currentExercise.id) && (
            <button
              onClick={copyLastSet}
              className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-4 transition-all active:scale-95"
            >
              <span className="text-base font-bold text-blue-400">前回のセットをコピー</span>
            </button>
          )}
        </div>

        {/* ショートカット連携のトグル */}
        <div className="mb-4 flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
          <div>
            <div className="text-base font-bold">ショートカットタイマー</div>
            <div className="text-xs opacity-70 mt-1">iOSショートカットでタイマーを起動</div>
          </div>
          <button
            onClick={() => {
              const newValue = !useShortcut;
              setUseShortcut(newValue);
              localStorage.setItem(USE_SHORTCUT_KEY, String(newValue));
            }}
            className={`w-14 h-8 rounded-full transition-all ${
              useShortcut ? 'bg-green-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full transition-all ${
                useShortcut ? 'ml-7' : 'ml-1'
              }`}
            />
          </button>
        </div>

        {/* セット記録ボタン */}
        <button
          onClick={logSet}
          className="w-full bg-green-500 hover:bg-green-600 rounded-2xl h-24 flex items-center justify-center mb-6 shadow-lg transition-all active:scale-95"
        >
          <span className="text-3xl font-bold text-white">セット記録</span>
        </button>

        {/* 今日の記録 */}
        {state.logs.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4">今日の記録</h3>
            <div className="space-y-3">
              {state.logs.map((log) => (
                <div key={log.id} className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0">
                  <div>
                    <div className="text-lg font-bold">{log.exerciseName}</div>
                    <div className="text-sm opacity-70">{log.bodyPart}</div>
                  </div>
                  <div className="text-lg font-mono">
                    {log.weight}kg × {log.reps}回
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 種目選択モーダル */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50" onClick={() => setShowExerciseModal(false)}>
          <div className="bg-zinc-900 rounded-t-3xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold">種目を選択</h3>
              <button onClick={() => setShowExerciseModal(false)} className="text-3xl opacity-70 hover:opacity-100">
                ✕
              </button>
            </div>
            <button
              onClick={() => {
                setShowExerciseModal(false);
                setShowAddExerciseModal(true);
              }}
              className="w-full bg-green-500 hover:bg-green-600 rounded-2xl py-4 mb-4 transition-all active:scale-95"
            >
              <span className="text-xl font-bold text-white">➕ 新しい種目を追加</span>
            </button>
            <div className="space-y-2">
              {exercises.map(exercise => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-3 py-4 border-b border-white/10"
                >
                  <button
                    onClick={() => changeExercise(exercise.id)}
                    className="flex-1 text-left hover:bg-white/5 transition-all active:scale-95 px-3 py-2 rounded-xl"
                  >
                    <div className="text-xl font-bold">{exercise.name}</div>
                    <div className="text-sm opacity-70">{exercise.part}</div>
                  </button>
                  {exercise.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`「${exercise.name}」を削除しますか？`)) {
                          deleteCustomExercise(exercise.id);
                          setExercises(getAllExercises());
                        }
                      }}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 font-bold transition-all active:scale-95"
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* カスタム種目追加モーダル */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50" onClick={() => setShowAddExerciseModal(false)}>
          <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">新しい種目を追加</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm opacity-70 mb-2">種目名</label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="例: インクラインベンチプレス"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm opacity-70 mb-2">部位</label>
                <select
                  value={newExercisePart}
                  onChange={(e) => setNewExercisePart(e.target.value as BodyPart)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-500"
                >
                  {Object.values(BODY_PARTS).map(part => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-4 border border-white/10 transition-all active:scale-95"
              >
                <span className="text-lg font-bold">キャンセル</span>
              </button>
              <button
                onClick={handleAddCustomExercise}
                disabled={!newExerciseName.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-4 transition-all active:scale-95"
              >
                <span className="text-lg font-bold text-white">追加</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 終了確認モーダル */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50" onClick={() => setShowFinishModal(false)}>
          <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">トレーニングを終了しますか?</h3>
            <p className="text-lg opacity-70 mb-8">
              記録をNotionに送信して終了します。
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-4 border border-white/10 transition-all active:scale-95"
              >
                <span className="text-lg font-bold">キャンセル</span>
              </button>
              <button
                onClick={confirmFinishWorkout}
                className="flex-1 bg-red-500 hover:bg-red-600 rounded-xl py-4 transition-all active:scale-95"
              >
                <span className="text-lg font-bold text-white">終了</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

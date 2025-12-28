/**
 * 筋トレ種目と部位のマッピング定数
 */

export const BODY_PARTS = {
  CHEST: '胸',
  BACK: '背中',
  LEGS: '脚',
  SHOULDERS: '肩',
  ARMS: '腕',
  ABS: '腹筋',
} as const;

export type BodyPart = typeof BODY_PARTS[keyof typeof BODY_PARTS];

export interface Exercise {
  id: string;
  name: string;
  part: BodyPart;
}

export const EXERCISES: Exercise[] = [
  { id: 'bp', name: 'ベンチプレス', part: BODY_PARTS.CHEST },
  { id: 'dp', name: 'ダンベルプレス', part: BODY_PARTS.CHEST },
  { id: 'fly', name: 'ダンベルフライ', part: BODY_PARTS.CHEST },
  { id: 'dl', name: 'デッドリフト', part: BODY_PARTS.BACK },
  { id: 'row', name: 'ベントオーバーロウ', part: BODY_PARTS.BACK },
  { id: 'lat', name: 'ラットプルダウン', part: BODY_PARTS.BACK },
  { id: 'sq', name: 'スクワット', part: BODY_PARTS.LEGS },
  { id: 'lp', name: 'レッグプレス', part: BODY_PARTS.LEGS },
  { id: 'ohp', name: 'ショルダープレス', part: BODY_PARTS.SHOULDERS },
  { id: 'slr', name: 'サイドレイズ', part: BODY_PARTS.SHOULDERS },
  { id: 'curl', name: 'アームカール', part: BODY_PARTS.ARMS },
  { id: 'tri', name: 'トライセプス・エクステンション', part: BODY_PARTS.ARMS },
  { id: 'abs', name: 'クランチ', part: BODY_PARTS.ABS },
];

/**
 * 種目IDから種目情報を取得
 */
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(ex => ex.id === id);
}

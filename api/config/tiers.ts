type ITier = {
  level: number;
  label: string;
};

export type ITiers = ITier[];

export const tiers: ITiers = [
  { level: 0, label: 'Bronze' },
  { level: 10, label: 'Silver' },
  { level: 20, label: 'Bronze' },
  { level: 30, label: 'Platinum' },
];

type ILevel = {
  level: number;
  points: number;
};

export type ILevels = ILevel[];

export const levels: ILevels = [
  { points: 0, level: 0 },
  { points: 23, level: 1 },
  { points: 48, level: 2 },
  { points: 73, level: 3 },
  { points: 99, level: 4 },
  { points: 125, level: 5 },
  { points: 151, level: 6 },
  { points: 177, level: 7 },
  { points: 204, level: 8 },
  { points: 231, level: 9 },
  { points: 258, level: 10 },
  { level: 11,	points: 285 },
  { level: 12,	points: 312 },
  { level: 13,	points: 339 },
  { level: 14,	points: 367 },
  { level: 15,	points: 395 },
  { level: 16,	points: 422 },
  { level: 17,	points: 450 },
  { level: 18,	points: 478 },
  { level: 19,	points: 506 },
  { level: 20,	points: 534 },
  { level: 21,	points: 562 },
  { level: 22,	points: 590 },
  { level: 23,	points: 618 },
  { level: 24,	points: 647 },
  { level: 25,	points: 675 },
  { level: 26,	points: 703 },
  { level: 28,	points: 760 },
  { level: 29,	points: 789 },
  { level: 30,	points: 850 },
]
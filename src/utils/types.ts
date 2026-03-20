export enum MoodCategory {
  Depressive = 'Depressivo',
  Manic = 'Maníaco',
  Mixed = 'Misto',
  Euthymic = 'Eutímico',
  Anxious = 'Ansioso'
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface MoodNode {
  id: string;
  label: string;
  description: string;
  category: MoodCategory;
  position: Vector3; // x: Valence, y: Energy, z: Stability
  color: string;
  clinicalRisk: number; // 0 to 100 (Percentual de risco imediato)
  neuroplasticity: number; // 0 to 100 (Potencial de adaptação neural)
}

export interface TimePoint {
  day: string;
  moodLevel: number;
  energyLevel: number;
}
export enum MoodCategory {
  Depressive = 'Depressivo',
  Manic = 'Maníaco',
  Mixed = 'Misto',
  Euthymic = 'Eutímico',
}

export type MoodNodeId =
  | 'euthymia'
  | 'cyclothymia'
  | 'major-depression'
  | 'dysthymia'
  | 'hypomania'
  | 'mania'
  | 'mixed-state'
  | 'agitated-depression'
  | 'catatonia';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * x = valência / humor
 * y = energia / ativação
 * z = estabilidade / controle
 */
export interface MoodNode {
  id: MoodNodeId;
  label: string;
  description: string;
  category: MoodCategory;
  position: Vector3;
  color: string;
  clinicalRisk: number; // 0-100
  neuroplasticity: number; // 0-100
}

export interface MoodPanelContentEntry {
  insight: string;
  elevation: number; // 0-1
}

export type MoodPanelContentMap = Record<MoodNodeId, MoodPanelContentEntry>;

export interface TimePoint {
  day: string;
  moodLevel: number;
  energyLevel: number;
}
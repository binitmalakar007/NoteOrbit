
export interface Section {
  id: string;
  title: string;
  summary: string;
}

export interface FileData {
  name: string;
  type: string;
  base64: string;
}

export interface AppState {
  file: FileData | null;
  sections: Section[];
  selectedSectionId: string | null;
  notes: Record<string, string>;
  isDarkMode: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_NOTES = 'GENERATING_NOTES',
  ERROR = 'ERROR'
}

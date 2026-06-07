export interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'zip' | 'link';
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  overview: string;
  resources: Resource[];
  thumbnail: string;
  // Solved Questions representation fields
  solvedTitle?: string;
  solvedDuration?: string;
  solvedOverview?: string;
  solvedResources?: Resource[];
  solvedThumbnail?: string;
  solvedCaptions?: { start: number; end: number; text: string }[];
  conceptCaptions?: { start: number; end: number; text: string }[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

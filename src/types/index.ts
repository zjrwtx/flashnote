export interface Card {
  id: string;
  title: string;
  content: string;
  level: number;
}

export interface ParsedMarkdown {
  cards: Card[];
  originalContent: string;
}

export interface FileData {
  id: string;
  name: string;
  cards: Card[];
  lastModified: number;
  currentIndex: number;
} 
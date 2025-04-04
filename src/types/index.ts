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
  pinned?: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  createdAt: number;
  favicon?: string;
}

export interface BookmarkCollection {
  id: string;
  name: string;
  bookmarks: Bookmark[];
  lastModified: number;
  pinned?: boolean;
} 
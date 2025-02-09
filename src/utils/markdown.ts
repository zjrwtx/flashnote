import { ParsedMarkdown, Card } from '../types';

export function parseMarkdown(content: string): ParsedMarkdown {
  const lines = content.split('\n');
  const cards: Card[] = [];
  let currentCard: Partial<Card> | null = null;
  let contentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#')) {
      // 如果有正在处理的卡片，保存它
      if (currentCard) {
        cards.push({
          ...currentCard,
          content: contentLines.join('\n').trim(),
        } as Card);
        contentLines = [];
      }

      // 创建新卡片
      const level = line.match(/^#+/)?.[0].length || 1;
      const title = line.replace(/^#+\s*/, '').trim();
      currentCard = {
        id: `card-${cards.length + 1}`,
        title,
        level,
      };
    } else if (currentCard) {
      contentLines.push(line);
    }
  }

  // 保存最后一个卡片
  if (currentCard) {
    cards.push({
      ...currentCard,
      content: contentLines.join('\n').trim(),
    } as Card);
  }

  console.log('解析结果:', {
    总卡片数: cards.length,
    卡片列表: cards
  });

  return {
    cards,
    originalContent: content,
  };
} 
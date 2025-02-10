export type Theme = {
  name: string;
  colors: {
    background: string;
    foreground: string;
    cardBackground: string;
    secondaryBackground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    accent: string;
    destructive: string;
    muted: string;
  };
};

export const themes: Theme[] = [
  {
    name: '经典黑',
    colors: {
      background: '#000000',
      foreground: '#ffffff',
      cardBackground: '#1c1c1e',
      secondaryBackground: '#2c2c2e',
      primary: '#0a84ff',
      primaryForeground: '#ffffff',
      secondary: '#636366',
      accent: '#30d158',
      destructive: '#ff453a',
      muted: '#8e8e93',
    },
  },
  {
    name: '清新绿',
    colors: {
      background: '#f0fff4',
      foreground: '#234e52',
      cardBackground: '#ffffff',
      secondaryBackground: '#e6fffa',
      primary: '#38b2ac',
      primaryForeground: '#ffffff',
      secondary: '#718096',
      accent: '#48bb78',
      destructive: '#f56565',
      muted: '#a0aec0',
    },
  },
  {
    name: '梦幻紫',
    colors: {
      background: '#faf5ff',
      foreground: '#44337a',
      cardBackground: '#ffffff',
      secondaryBackground: '#f3ebff',
      primary: '#805ad5',
      primaryForeground: '#ffffff',
      secondary: '#718096',
      accent: '#9f7aea',
      destructive: '#f56565',
      muted: '#a0aec0',
    },
  },
  {
    name: '活力橙',
    colors: {
      background: '#fffaf0',
      foreground: '#7b341e',
      cardBackground: '#ffffff',
      secondaryBackground: '#fff5eb',
      primary: '#ed8936',
      primaryForeground: '#ffffff',
      secondary: '#718096',
      accent: '#f6ad55',
      destructive: '#f56565',
      muted: '#a0aec0',
    },
  },
  {
    name: '海洋蓝',
    colors: {
      background: '#ebf8ff',
      foreground: '#2a4365',
      cardBackground: '#ffffff',
      secondaryBackground: '#e6f6ff',
      primary: '#4299e1',
      primaryForeground: '#ffffff',
      secondary: '#718096',
      accent: '#63b3ed',
      destructive: '#f56565',
      muted: '#a0aec0',
    },
  },
]; 
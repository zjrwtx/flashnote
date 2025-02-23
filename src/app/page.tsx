'use client';

import { useState, useRef, useEffect } from 'react';
import type { JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  HomeIcon,
  PlusIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  CheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  TrashIcon,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { parseMarkdown } from '../utils/markdown';
import type { FileData } from '../types';
import { themes, type Theme } from '../utils/themes';

const STORAGE_KEY = 'flashnote-files';
const THEME_KEY = 'flashnote-theme';

type Tab = 'home' | 'study' | 'edit';

// 添加搜索结果类型
interface SearchResult {
  fileId: string;
  fileName: string;
  cardIndex: number;
  title: string;
  content: string;
  matchPositions: { start: number; end: number; }[];
}

export default function Home() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showToc, setShowToc] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showThemes, setShowThemes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editContent, setEditContent] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 添加搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // 从本地存储加载数据
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const savedFiles = JSON.parse(savedData);
        setFiles(savedFiles);
      } catch (error) {
        console.error('加载保存的数据失败:', error);
      }
    }
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [files]);

  // 从本地存储加载主题
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      try {
        const theme = themes.find(t => t.name === savedTheme);
        if (theme) {
          setCurrentTheme(theme);
          applyTheme(theme);
        }
      } catch (error) {
        console.error('加载主题失败:', error);
      }
    }
  }, []);

  // 应用主题
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(
        `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
        value
      );
    });
    localStorage.setItem(THEME_KEY, theme.name);
  };

  const currentFile = files.find(f => f.id === currentFileId);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('没有选择文件');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('选择的文件:', file.name);
      const text = await file.text();
      console.log('文件内容:', text);
      const { cards } = parseMarkdown(text);
      console.log('解析后的卡片:', cards);

      const newFile: FileData = {
        id: Date.now().toString() + i,
        name: file.name,
        cards,
        lastModified: file.lastModified,
        currentIndex: 0,
      };

      setFiles(prev => [...prev, newFile]);
    }
    
    if (files.length === 1) {
      const newFileId = Date.now().toString() + '0';
      setCurrentFileId(newFileId);
      setActiveTab('study');
    }
  };

  const handleExport = (fileId?: string) => {
    if (fileId) {
      // 导出单个文件
      const file = files.find(f => f.id === fileId);
      if (!file) return;
      
      const content = file.cards.map(card => {
        const hashtags = '#'.repeat(card.level);
        return `${hashtags} ${card.title}\n\n${card.content}`;
      }).join('\n\n');
      
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // 导出所有文件
      files.forEach(file => {
        const content = file.cards.map(card => {
          const hashtags = '#'.repeat(card.level);
          return `${hashtags} ${card.title}\n\n${card.content}`;
        }).join('\n\n');
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (window.confirm('确定要删除这个文件吗？')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (currentFileId === fileId) {
        setCurrentFileId(null);
        setActiveTab('home');
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要清除所有文件吗？')) {
      setFiles([]);
      setCurrentFileId(null);
      setActiveTab('home');
    }
  };

  // 添加搜索函数
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const searchRegex = new RegExp(query, 'gi');

    files.forEach(file => {
      file.cards.forEach((card, cardIndex) => {
        const contentToSearch = `${card.title}\n${card.content}`;
        const matches = [...contentToSearch.matchAll(searchRegex)];
        
        if (matches.length > 0) {
          const matchPositions = matches.map(match => ({
            start: match.index!,
            end: match.index! + match[0].length,
          }));

          results.push({
            fileId: file.id,
            fileName: file.name,
            cardIndex,
            title: card.title,
            content: contentToSearch,
            matchPositions,
          });
        }
      });
    });

    setSearchResults(results);
  };

  // 添加跳转到卡片函数
  const jumpToCard = (fileId: string, cardIndex: number) => {
    setCurrentFileId(fileId);
    updateCurrentIndex(fileId, cardIndex);
    setActiveTab('study');
  };

  // 添加高亮显示函数
  const highlightText = (text: string, positions: { start: number; end: number; }[]) => {
    let lastIndex = 0;
    const parts: JSX.Element[] = [];

    positions.forEach((pos, i) => {
      // 添加不匹配的文本
      if (pos.start > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {text.slice(lastIndex, pos.start)}
          </span>
        );
      }
      // 添加高亮文本
      parts.push(
        <span key={`highlight-${i}`} className="bg-primary/20 text-primary rounded px-1">
          {text.slice(pos.start, pos.end)}
        </span>
      );
      lastIndex = pos.end;
    });

    // 添加剩余文本
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-last">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const updateCurrentIndex = (fileId: string, newIndex: number) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, currentIndex: newIndex } : f
    ));
  };

  const nextCard = () => {
    if (currentFile && currentFile.currentIndex < currentFile.cards.length - 1) {
      updateCurrentIndex(currentFile.id, currentFile.currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentFile && currentFile.currentIndex > 0) {
      updateCurrentIndex(currentFile.id, currentFile.currentIndex - 1);
    }
  };

  // 处理数学公式的渲染
  const renderContent = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 自定义段落渲染
          p: ({ children }) => {
            return <div className="mb-4">{children}</div>;
          },
          // 自定义图片渲染
          img: ({ src, alt }) => {
            if (!src) return null;
            return (
              <div className="my-6">
                <div className="flex justify-center">
                  <img
                    src={src}
                    alt={alt || ''}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    loading="lazy"
                  />
                </div>
                {alt && (
                  <div className="text-center text-sm text-secondary mt-2">
                    {alt}
                  </div>
                )}
              </div>
            );
          },
          // 自定义标题渲染，增加间距
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-8 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const handleCreateNote = () => {
    setEditContent(`# 新笔记

在这里输入笔记内容...`);
    setEditFileName('新笔记.md');
    setActiveTab('edit');
  };

  const handleSaveNote = () => {
    const { cards } = parseMarkdown(editContent);
    
    // 从第一个一级标题获取文件名
    let fileName = '新笔记.md';
    if (cards.length > 0 && cards[0].level === 1) {
      fileName = `${cards[0].title}.md`;
    }

    const newFile: FileData = {
      id: Date.now().toString(),
      name: fileName,
      cards,
      lastModified: Date.now(),
      currentIndex: 0,
    };

    setFiles(prev => [...prev, newFile]);
    setCurrentFileId(newFile.id);
    setActiveTab('study');
  };

  const handleEditFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const content = file.cards.map(card => {
      const hashtags = '#'.repeat(card.level);
      return `${hashtags} ${card.title}\n\n${card.content}`;
    }).join('\n\n');

    setEditContent(content);
    setEditFileName(file.name);
    setActiveTab('edit');
  };

  const handleTogglePin = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, pinned: !f.pinned } : f
    ));
  };

  const renderMainContent = () => {
    if (files.length === 0) {
      return (
        <div className="text-center px-4">
          <div className="mb-8">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">开始学习</h2>
            <p className="text-secondary mb-8">导入 Markdown 文件开始制作抽认卡</p>
          </div>
          <button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="apple-button w-full max-w-xs"
          >
            导入 Markdown 文件
          </button>
          <div className="mt-8 apple-card p-4 text-left">
            <p className="text-sm font-medium mb-2">支持的格式：</p>
            <pre className="text-xs text-secondary whitespace-pre-wrap">
              {`# 标题1
这是第一个卡片的内容
- 支持列表
- **支持加粗**
- 支持公式：$E = mc^2$

## 标题2
这是第二个卡片的内容
支持行内公式：$\\alpha + \\beta$
也支持块级公式：
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$`}
            </pre>
          </div>
        </div>
      );
    }

    if (activeTab === 'home') {
      return (
        <div className="px-4 pb-20">
          {/* 搜索框 */}
          <div className="sticky top-0 z-10 -mx-4 px-4 py-2 glass">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 pr-10 apple-card bg-card-background text-sm"
                placeholder="搜索笔记内容..."
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                {searchQuery ? (
                  <button
                    onClick={() => handleSearch('')}
                    className="p-1 hover:text-primary transition-colors"
                    aria-label="清除搜索"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 搜索结果 */}
          {searchQuery && (
            <div className="mt-4 space-y-4">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-secondary">
                    找到 {searchResults.length} 个结果
                  </p>
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.fileId}-${result.cardIndex}-${index}`}
                      className="apple-card p-4 cursor-pointer hover:scale-[1.01] transition-transform"
                      onClick={() => jumpToCard(result.fileId, result.cardIndex)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <DocumentTextIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-secondary">{result.fileName}</span>
                      </div>
                      <h3 className="font-medium mb-1">
                        {highlightText(result.title, result.matchPositions.filter(pos => pos.start < result.title.length))}
                      </h3>
                      <p className="text-sm text-secondary line-clamp-2">
                        {highlightText(
                          result.content.slice(result.title.length + 1),
                          result.matchPositions
                            .filter(pos => pos.start > result.title.length)
                            .map(pos => ({
                              start: pos.start - result.title.length - 1,
                              end: pos.end - result.title.length - 1
                            }))
                        )}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-secondary">
                  <p>未找到匹配的内容</p>
                </div>
              )}
            </div>
          )}

          {/* 原有的文件列表 */}
          {!searchQuery && (
            <>
              <div className="flex justify-end mb-4 gap-2">
                {files.length > 0 && (
                  <button
                    onClick={() => handleExport()}
                    className="px-4 py-2 text-sm text-primary hover:text-accent rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    导出全部
                  </button>
                )}
              </div>
              <div className="grid gap-4 grid-cols-1">
                {files
                  .sort((a, b) => {
                    // 首先按照置顶状态排序
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    // 然后按照修改时间排序
                    return b.lastModified - a.lastModified;
                  })
                  .map(file => (
                    <div
                      key={file.id}
                      className="apple-card p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex items-center gap-3 flex-1"
                          onClick={() => {
                            setCurrentFileId(file.id);
                            setActiveTab('study');
                          }}
                        >
                          <div className="bg-secondary-background p-2 rounded-xl">
                            <DocumentTextIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{file.name}</h3>
                              {file.pinned && (
                                <StarIconSolid className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-secondary">
                              {file.cards.length} 张卡片
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePin(file.id)}
                            className={`text-secondary p-2 transition-colors ${
                              file.pinned ? 'text-primary hover:text-secondary' : 'hover:text-primary'
                            }`}
                            title={file.pinned ? "取消置顶" : "置顶"}
                          >
                            {file.pinned ? (
                              <StarIconSolid className="w-5 h-5" />
                            ) : (
                              <StarIcon className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditFile(file.id)}
                            className="text-secondary hover:text-primary p-2 transition-colors"
                            title="编辑"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleExport(file.id)}
                            className="text-secondary hover:text-primary p-2 transition-colors"
                            title="导出"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-secondary hover:text-destructive p-2 transition-colors"
                            title="删除"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      );
    }

    if (activeTab === 'edit') {
      return (
        <div className="h-[calc(100vh-8rem)] pb-20">
          <div className="px-4 py-2 glass sticky top-0 z-10 flex items-center justify-between">
            <input
              type="text"
              value={editFileName}
              onChange={(e) => setEditFileName(e.target.value)}
              className="bg-transparent border-none outline-none font-medium flex-1 mr-2"
              placeholder="文件名"
            />
            <button
              onClick={handleSaveNote}
              className="p-2 text-primary hover:text-accent transition-colors"
              aria-label="保存笔记"
            >
              <CheckIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-[calc(100vh-16rem)] p-4 apple-card font-mono text-sm resize-none focus:outline-none"
              placeholder="在这里输入 Markdown 内容..."
            />
          </div>
        </div>
      );
    }

    if (currentFile) {
      return (
        <div className="h-[calc(100vh-8rem)] pb-20">
          <div className="px-4 py-2 glass sticky top-0 z-10 flex items-center justify-between">
            <button
              onClick={() => setShowToc(prev => !prev)}
              className="p-2 -ml-2 text-secondary hover:text-primary transition-colors"
              aria-label={showToc ? "关闭目录" : "打开目录"}
            >
              {showToc ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
            <h2 className="font-medium truncate flex-1 text-center">
              {currentFile.name}
            </h2>
          </div>

          <div className="relative h-full flex">
            {/* 目录侧边栏 */}
            <AnimatePresence>
              {showToc && (
                <motion.div
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  className="absolute top-0 left-0 w-[280px] h-full glass border-r border-secondary/10 z-20 overflow-y-auto"
                >
                  <div className="p-4">
                    <h3 className="font-medium text-secondary mb-2">目录</h3>
                    <div className="space-y-1">
                      {currentFile.cards.map((card, index) => (
                        <button
                          key={card.id}
                          onClick={() => {
                            updateCurrentIndex(currentFile.id, index);
                            setShowToc(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            index === currentFile.currentIndex
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'hover:bg-secondary-background'
                          }`}
                          style={{
                            paddingLeft: `${(card.level - 1) * 1 + 0.75}rem`,
                          }}
                        >
                          {card.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 遮罩层 */}
            <AnimatePresence>
              {showToc && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowToc(false)}
                  className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10"
                />
              )}
            </AnimatePresence>

            {/* 主内容区 */}
            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFile.currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <div className="p-4 apple-card min-h-full">
                    <h2 className="text-xl font-semibold mb-4">
                      {currentFile.cards[currentFile.currentIndex].title}
                    </h2>
                    <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-secondary/20 [&_td]:p-2 [&_th]:border [&_th]:border-secondary/20 [&_th]:p-2 [&_tr]:even:bg-secondary-background/50">
                      {renderContent(currentFile.cards[currentFile.currentIndex].content)}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="fixed bottom-20 left-0 right-0 flex justify-center space-x-4 px-4">
            <button
              onClick={prevCard}
              disabled={currentFile.currentIndex === 0}
              className="p-4 rounded-full glass disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
              aria-label="上一张卡片"
            >
              <ChevronUpIcon className="w-6 h-6" />
            </button>
            <button
              onClick={nextCard}
              disabled={currentFile.currentIndex === currentFile.cards.length - 1}
              className="p-4 rounded-full glass disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
              aria-label="下一张卡片"
            >
              <ChevronDownIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="fixed bottom-32 left-0 right-0 text-center">
            <p className="text-sm font-medium text-secondary glass py-1">
              {currentFile.currentIndex + 1} / {currentFile.cards.length}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="safe-top glass">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">FlashNote</h1>
          {files.length > 0 && activeTab === 'home' && (
            <button
              onClick={handleReset}
              className="text-sm text-destructive"
            >
              清空
            </button>
          )}
        </div>
      </div>

      <input
        type="file"
        accept=".md"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        aria-label="导入 Markdown 文件"
      />

      {renderMainContent()}

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 safe-bottom">
        {/* 导航栏主体 */}
        <div className="glass border-t border-secondary/10 bg-card-background/80">
          <div className="flex items-center justify-between px-6 py-2 max-w-lg mx-auto relative">
            {/* 首页按钮 */}
            <button
              onClick={() => {
                setActiveTab('home');
                setCurrentFileId(null);
              }}
              className={`flex flex-col items-center w-16 py-1 transition-all ${
                activeTab === 'home' 
                  ? 'text-primary' 
                  : 'text-secondary hover:text-primary/80'
              }`}
            >
              {activeTab === 'home' ? (
                <HomeIconSolid className="w-7 h-7" />
              ) : (
                <HomeIcon className="w-7 h-7" />
              )}
              <span className="text-xs mt-0.5">首页</span>
            </button>

            {/* 导入按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center w-16 py-1 transition-all text-secondary hover:text-primary/80`}
            >
              <ArrowUpTrayIcon className="w-7 h-7" />
              <span className="text-xs mt-0.5">导入</span>
            </button>

            {/* 新建按钮 */}
            <button
              onClick={handleCreateNote}
              className="absolute left-1/2 -translate-x-1/2 -top-6 bg-primary text-black p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              aria-label="新建笔记"
            >
              <PlusIcon className="w-6 h-6" />
            </button>

            {/* 学习按钮 */}
            <button
              onClick={() => {
                if (currentFileId) {
                  setActiveTab('study');
                }
              }}
              className={`flex flex-col items-center w-16 py-1 transition-all ${
                activeTab === 'study' 
                  ? 'text-primary' 
                  : 'text-secondary hover:text-primary/80'
              }`}
            >
              {activeTab === 'study' ? (
                <DocumentTextIconSolid className="w-7 h-7" />
              ) : (
                <DocumentTextIcon className="w-7 h-7" />
              )}
              <span className="text-xs mt-0.5">学习</span>
            </button>

            {/* 主题按钮 */}
            <button
              onClick={() => setShowThemes(prev => !prev)}
              className={`flex flex-col items-center w-16 py-1 transition-all ${
                showThemes 
                  ? 'text-primary' 
                  : 'text-secondary hover:text-primary/80'
              }`}
            >
              <div
                className="w-7 h-7 rounded-xl border-2 border-current"
                style={{ background: currentTheme.colors.primary }}
              />
              <span className="text-xs mt-0.5">主题</span>
            </button>
          </div>
        </div>

        {/* 主题选择面板 */}
        <AnimatePresence>
          {showThemes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full left-0 right-0 p-4 glass border-t border-secondary/10 bg-card-background/95"
            >
              <div className="grid grid-cols-5 gap-4 max-w-lg mx-auto">
                {themes.map(theme => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      setCurrentTheme(theme);
                      applyTheme(theme);
                      setShowThemes(false);
                    }}
                    className="flex flex-col items-center gap-2 transition-all hover:scale-110"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl border-2 ${
                        theme.name === currentTheme.name 
                          ? 'border-primary shadow-lg' 
                          : 'border-secondary/20'
                      }`}
                      style={{ background: theme.colors.primary }}
                    />
                    <span className="text-xs font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

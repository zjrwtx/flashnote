'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  HomeIcon,
  PlusIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  TrashIcon,
} from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { parseMarkdown } from '../utils/markdown';
import type { FileData } from '../types';

const STORAGE_KEY = 'flashnote-files';

type Tab = 'home' | 'study';

export default function Home() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showToc, setShowToc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const currentFile = files.find(f => f.id === currentFileId);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('没有选择文件');
      return;
    }

    console.log('选择的文件:', file.name);
    const text = await file.text();
    console.log('文件内容:', text);
    const { cards } = parseMarkdown(text);
    console.log('解析后的卡片:', cards);

    const newFile: FileData = {
      id: Date.now().toString(),
      name: file.name,
      cards,
      lastModified: file.lastModified,
      currentIndex: 0,
    };

    setFiles(prev => [...prev, newFile]);
    setCurrentFileId(newFile.id);
    setActiveTab('study');
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
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
      >
        {content}
      </ReactMarkdown>
    );
  };

  const renderMainContent = () => {
    if (files.length === 0) {
      return (
        <div className="text-center px-4">
          <div className="mb-8">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">开始学习</h2>
            <p className="text-gray-500 mb-8">导入 Markdown 文件开始制作抽认卡</p>
          </div>
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-blue-600 transition-colors w-full max-w-xs"
          >
            导入 Markdown 文件
          </button>
          <div className="mt-8 bg-gray-50 rounded-2xl p-4 text-left">
            <p className="text-sm font-medium mb-2">支持的格式：</p>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
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
          <div className="grid gap-4 grid-cols-1">
            {files.map(file => (
              <div
                key={file.id}
                className="bg-white rounded-2xl shadow p-4 hover:shadow-md transition-shadow"
                onClick={() => {
                  setCurrentFileId(file.id);
                  setActiveTab('study');
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-xl">
                      <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{file.name}</h3>
                      <p className="text-sm text-gray-500">
                        {file.cards.length} 张卡片
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-2"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentFile) {
      return (
        <div className="h-[calc(100vh-8rem)] pb-20">
          <div className="px-4 py-2 backdrop-blur-lg bg-white/80 sticky top-0 z-10 flex items-center justify-between">
            <button
              onClick={() => setShowToc(prev => !prev)}
              className="p-2 -ml-2 text-gray-500"
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
                  className="absolute top-0 left-0 w-[280px] h-full bg-white border-r border-gray-100 z-20 overflow-y-auto"
                >
                  <div className="p-4">
                    <h3 className="font-medium text-gray-500 mb-2">目录</h3>
                    <div className="space-y-1">
                      {currentFile.cards.map((card, index) => (
                        <button
                          key={card.id}
                          onClick={() => {
                            updateCurrentIndex(currentFile.id, index);
                            setShowToc(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                            index === currentFile.currentIndex
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'hover:bg-gray-50'
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
                  className="absolute inset-0 bg-black/20 z-10"
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
                  <div className="p-4 bg-white rounded-t-3xl min-h-full">
                    <h2 className="text-xl font-semibold mb-4">
                      {currentFile.cards[currentFile.currentIndex].title}
                    </h2>
                    <div className="prose prose-sm max-w-none [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_tr]:even:bg-gray-50">
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
              className="p-4 rounded-full bg-white shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              <ChevronUpIcon className="w-6 h-6" />
            </button>
            <button
              onClick={nextCard}
              disabled={currentFile.currentIndex === currentFile.cards.length - 1}
              className="p-4 rounded-full bg-white shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              <ChevronDownIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="fixed bottom-32 left-0 right-0 text-center">
            <p className="text-sm font-medium text-gray-500 bg-white/80 backdrop-blur-sm py-1">
              {currentFile.currentIndex + 1} / {currentFile.cards.length}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="safe-top bg-white">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">FlashNote</h1>
          {files.length > 0 && activeTab === 'home' && (
            <button
              onClick={handleReset}
              className="text-sm text-red-600"
            >
              清空
            </button>
          )}
        </div>
      </div>

      <input
        type="file"
        accept=".md"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {renderMainContent()}

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
        <div className="flex items-center justify-around px-4 py-2">
          <button
            onClick={() => {
              setActiveTab('home');
              setCurrentFileId(null);
            }}
            className={`flex flex-col items-center p-2 ${
              activeTab === 'home' ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            {activeTab === 'home' ? (
              <HomeIconSolid className="w-6 h-6" />
            ) : (
              <HomeIcon className="w-6 h-6" />
            )}
            <span className="text-xs mt-1">首页</span>
          </button>
          
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white p-4 rounded-full shadow-lg -mt-8"
          >
            <PlusIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              if (currentFileId) {
                setActiveTab('study');
              }
            }}
            className={`flex flex-col items-center p-2 ${
              activeTab === 'study' ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            {activeTab === 'study' ? (
              <DocumentTextIconSolid className="w-6 h-6" />
            ) : (
              <DocumentTextIcon className="w-6 h-6" />
            )}
            <span className="text-xs mt-1">学习</span>
          </button>
        </div>
      </div>
    </main>
  );
}

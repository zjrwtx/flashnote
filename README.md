# FlashNote

FlashNote 是一个基于 Next.js 开发的渐进式 Web 应用（PWA），可以将 Markdown 文档转换为抽认卡进行学习。它支持数学公式、表格、列表等多种格式，是一个轻量级的学习工具。

在线体验：https://www.zjrwtx.online

## ✨ 功能特点

### 📝 笔记管理
- 支持导入多个 Markdown 文件
- 支持在线创建和编辑笔记
- 自动从一级标题提取文件名
- 支持单个或批量导出笔记

### 🔍 内容搜索
- 全文搜索功能
- 实时搜索结果展示
- 搜索结果高亮显示
- 点击结果直接跳转到对应卡片

### 📱 界面设计
- 支持多种精美主题配色
- 支持 PWA，可安装到桌面
- 响应式设计，支持移动端
- 简洁的卡片式学习界面
- 流畅的动画过渡效果

### 📊 格式支持
- 支持 Markdown 基础语法
- 支持数学公式（KaTeX）
- 支持表格和列表
- 支持代码块高亮

### 💾 数据管理
- 本地存储，无需登录
- 支持离线使用
- 数据导入导出功能
- 主题偏好记忆

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/zjrwtx/flashnote.git

# 进入项目目录
cd flashnote

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📖 使用说明

### 导入笔记
1. 点击底部导航栏的"导入"按钮
2. 选择一个或多个 Markdown 文件
3. 文件会自动解析为抽认卡

### 创建笔记
1. 点击底部导航栏的"新建"按钮
2. 使用 Markdown 编写内容
3. 使用标题层级来划分卡片
4. 点击保存按钮完成创建

### 搜索内容
1. 在首页顶部搜索框输入关键词
2. 实时查看匹配结果
3. 点击任意结果跳转到对应卡片

### 主题切换
1. 点击底部导航栏的"主题"按钮
2. 从多个精美主题中选择
3. 主题设置会自动保存

### Markdown 格式示例

```markdown
# 标题1
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
$$
```

## 🛠️ 技术栈

- [Next.js](https://nextjs.org/) - React 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Tailwind CSS](https://tailwindcss.com/) - 样式
- [Framer Motion](https://www.framer.com/motion/) - 动画效果
- [KaTeX](https://katex.org/) - 数学公式渲染
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染

## 📱 PWA 支持

FlashNote 支持作为 PWA 安装到桌面：

1. 在移动设备上使用 Chrome/Safari 访问应用
2. 点击浏览器的"添加到主屏幕"选项
3. 完成安装后可以离线使用

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

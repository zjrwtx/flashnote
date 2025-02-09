# FlashNote

FlashNote 是一个基于 Next.js 开发的渐进式 Web 应用（PWA），可以将 Markdown 文档转换为抽认卡进行学习。它支持数学公式、表格、列表等多种格式，是一个轻量级的学习工具。

## ✨ 功能特点

- 📱 支持 PWA，可安装到桌面
- 📝 支持 Markdown 格式
- ⚡️ 支持数学公式（KaTeX）
- 📊 支持表格和列表
- 🎯 简洁的卡片式学习界面
- 📂 本地存储，无需登录
- 🎨 响应式设计，支持移动端
<img width="1469" alt="image" src="https://github.com/user-attachments/assets/cefd7f91-29b8-4998-95ca-d2741801f167" />
<img width="1469" alt="image" src="https://github.com/user-attachments/assets/e8acf1ec-5867-484b-aa69-8cc594916bb0" />
<img width="1460" alt="image" src="https://github.com/user-attachments/assets/d863da2b-784c-44c2-9279-0960452e8c59" />
<img width="1468" alt="image" src="https://github.com/user-attachments/assets/ed64265d-93bc-4095-8158-d8912b87cb8e" />

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

1. 准备一个 Markdown 文件，使用标题层级来划分卡片
2. 点击"导入 Markdown 文件"按钮上传文件
3. 点击"学习"开始浏览卡片
4. 使用上下按钮切换卡片
5. 点击左上角按钮查看目录

### Markdown 格式示例

```markdown
# 标题1
这是第一个卡片的内容
- 支持列表
- **支持加粗**
- 支持公式：$E = mc^2$

## 标题2
这是第二个卡片的内容
支持行内公式：$\alpha + \beta$
也支持块级公式：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
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

# 靜態部落格系統

https://marvelshan.github.io/kiro-aws-ai-demo/

使用 Git Submodule 從外部 repository 載入 Markdown 文章，透過 GitHub Pages 和原生 JavaScript 建構。

## 功能特色

- Markdown + YAML frontmatter 撰寫文章，自動掃描索引
- 即時搜尋（標題、內容、標籤）
- 進場動畫 Intro Overlay，完成後滑動揭開頁面
- 文章卡片 Scroll-Reveal 淡入動畫
- 響應式設計、程式碼語法高亮
- GitHub Actions 自動建置部署，每日自動更新 submodule

## 架構

```
Tech-Forum (Submodule) → GitHub Actions → GitHub Pages
```

- `articles/` — Git Submodule，來自 `marvelshan/tech-forum`
- `frontend/` — 原生 JS SPA（app.js、router.js、search.js、styles.css、intro.css）
- `scripts/` — 建置腳本（掃描、解析、產生 list.json）
- `.github/workflows/` — 自動部署與 submodule 更新

## 快速開始

```bash
git clone --recurse-submodules https://github.com/marvelshan/kiro-aws-ai-demo.git
cd kiro-aws-ai-demo
npm install
npm run build
npx http-server dist
```

## 文章管理

文章放在 `articles/` submodule（`marvelshan/tech-forum`）。

Frontmatter 格式：

```yaml
---
title: "文章標題"
date: "2024-12-05"
description: "簡短描述"
tags: ["標籤1", "標籤2"]
---
```

手動更新 submodule：

```bash
git submodule update --remote articles
git add articles && git commit -m "更新文章" && git push
```

## 部署

推送到 main branch，GitHub Actions 自動建置並部署到 GitHub Pages。

需先在 repository 設定 → Pages → Source 選擇「GitHub Actions」。

## 腳本

- `npm run build` — 本地建置
- `npm run deploy` — 建置靜態檔案
- `npm test` — 執行測試

## 授權

MIT

# 搜尋和 GitHub 導入功能使用說明

## 功能概述

這個部落格系統現在支援兩個強大的新功能：

1. **文章搜尋**：即時搜尋所有文章的標題、內容和標籤
2. **GitHub Repository 導入**：從任何 GitHub repository 自動讀取 markdown 檔案

## 搜尋功能

### 如何使用

1. 在頁面頂部的搜尋欄輸入關鍵字
2. 系統會即時顯示匹配的文章
3. 點擊 ✕ 按鈕清除搜尋

### 搜尋範圍

搜尋會檢查以下內容：
- **文章標題**（最高權重）
- **標籤**（高權重）
- **文章描述**（中等權重）
- **文章內容**（較低權重）

### 搜尋技巧

- 輸入多個關鍵字會搜尋包含任一關鍵字的文章
- 搜尋不區分大小寫
- 結果按相關性排序

## GitHub Repository 導入功能

### 如何使用

1. 點擊頁面頂部的「導入 GitHub Repo」按鈕
2. 在彈出的對話框中輸入 GitHub repository URL
3. 點擊「讀取文章」按鈕
4. 系統會顯示找到的所有 markdown 檔案預覽
5. 確認後點擊「確認導入」

### 支援的 URL 格式

- 完整 URL：`https://github.com/owner/repo`
- 簡短格式：`owner/repo`
- 帶 .git 後綴：`https://github.com/owner/repo.git`

### 範例

試試這個範例 repository：
```
https://github.com/marvelshan/tech-forum
```

### 功能特點

1. **自動掃描**：遞迴掃描 repository 中所有目錄的 markdown 檔案
2. **Frontmatter 解析**：自動解析 YAML frontmatter 中的 metadata
3. **智能回退**：如果沒有 frontmatter，使用檔案名稱作為標題
4. **即時預覽**：導入前可以預覽將要導入的文章
5. **完整內容**：導入的文章包含完整的 markdown 內容

### Frontmatter 格式

系統支援以下 frontmatter 欄位：

```yaml
---
title: "文章標題"
date: "2024-12-04"
description: "文章描述"
tags: "tag1, tag2, tag3"
---
```

如果沒有 frontmatter，系統會：
- 使用檔案名稱作為標題
- 使用當前日期
- 嘗試從第一個標題提取標題

### 限制

1. **API 速率限制**：GitHub API 有速率限制（未認證：60 次/小時）
2. **檔案大小**：非常大的 repository 可能需要較長時間載入
3. **私有 repository**：目前僅支援公開的 repository

## 技術實作

### 搜尋實作

- 使用客戶端搜尋索引
- 支援多關鍵字搜尋
- 基於權重的相關性排序
- 防抖動（debounce）優化性能

### GitHub 導入實作

- 使用 GitHub REST API v3
- 遞迴掃描目錄結構
- 支援 YAML frontmatter 解析
- 客戶端處理，無需後端

## 使用場景

### 搜尋功能適用於

- 快速找到特定主題的文章
- 按標籤篩選文章
- 探索相關內容

### GitHub 導入適用於

- 快速建立部落格網站
- 展示 GitHub 上的技術文件
- 分享開源專案的文檔
- 建立知識庫網站

## 未來改進

可能的功能增強：

1. **進階搜尋**
   - 按日期範圍篩選
   - 按標籤篩選
   - 正則表達式搜尋

2. **GitHub 導入增強**
   - 支援私有 repository（需要 token）
   - 選擇性導入特定目錄
   - 定期同步更新
   - 支援其他 Git 平台（GitLab, Bitbucket）

3. **持久化**
   - 將導入的文章儲存到 localStorage
   - 記住上次導入的 repository
   - 離線支援

## 故障排除

### 搜尋沒有結果

- 確認文章已經載入
- 嘗試使用不同的關鍵字
- 檢查瀏覽器控制台是否有錯誤

### GitHub 導入失敗

- 確認 URL 格式正確
- 確認 repository 是公開的
- 檢查是否超過 API 速率限制
- 確認 repository 中有 markdown 檔案

### API 速率限制

如果遇到速率限制：
- 等待一小時後重試
- 或使用 GitHub Personal Access Token（需要修改程式碼）

## 開發者資訊

### 相關檔案

- `frontend/search.js` - 搜尋功能實作
- `frontend/github-importer.js` - GitHub 導入功能實作
- `frontend/app.js` - 主應用程式邏輯
- `frontend/index.html` - UI 模板
- `frontend/styles.css` - 樣式定義

### API 參考

#### ArticleSearch 類別

```javascript
const search = new ArticleSearch();
search.initialize(articles);
const results = search.search('keyword');
```

#### GitHubImporter 類別

```javascript
const importer = new GitHubImporter();
const articles = await importer.importRepository('owner/repo');
```

## 回饋與貢獻

如果你有任何建議或發現問題，歡迎：
- 提交 Issue
- 發送 Pull Request
- 聯繫開發團隊

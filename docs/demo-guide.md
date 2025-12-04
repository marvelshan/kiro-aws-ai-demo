# 功能演示指南

## 快速開始

### 1. 啟動本地伺服器

```bash
npm run build
npx http-server dist -p 8080 -c-1 --proxy http://localhost:8080?
```

訪問：http://localhost:8080

## 搜尋功能演示

### 基本搜尋

1. 在頁面頂部的搜尋欄輸入關鍵字，例如：
   - `kubernetes`
   - `docker`
   - `部署`

2. 觀察即時搜尋結果

3. 點擊 ✕ 按鈕清除搜尋

### 搜尋測試案例

試試這些搜尋：

| 搜尋詞 | 預期結果 |
|--------|----------|
| `Day` | 所有包含 "Day" 的文章 |
| `kubernetes pod` | 包含 kubernetes 或 pod 的文章 |
| `linux` | Linux 相關文章 |

## GitHub 導入功能演示

### 演示步驟

#### 步驟 1：打開導入對話框

1. 點擊頁面頂部的「導入 GitHub Repo」按鈕
2. 看到彈出的對話框

#### 步驟 2：輸入 Repository URL

試試這些範例 repositories：

**範例 1：技術論壇**
```
https://github.com/marvelshan/tech-forum
```

**範例 2：你自己的 repository**
```
your-username/your-repo
```

#### 步驟 3：讀取文章

1. 點擊「讀取文章」按鈕
2. 等待系統掃描 repository
3. 查看找到的文章預覽

#### 步驟 4：確認導入

1. 檢查預覽的文章列表
2. 點擊「確認導入」
3. 系統會顯示成功訊息
4. 自動跳轉到文章列表頁面

#### 步驟 5：瀏覽導入的文章

1. 在文章列表中看到所有導入的文章
2. 點擊任何文章查看完整內容
3. 使用搜尋功能查找特定文章

### 測試不同的 Repository

試試導入這些不同類型的 repositories：

1. **技術文檔**
   ```
   https://github.com/marvelshan/tech-forum
   ```

2. **部落格文章**
   - 任何包含 markdown 文章的個人部落格 repo

3. **專案文檔**
   - 開源專案的 docs 目錄

## 組合使用

### 場景 1：導入後搜尋

1. 導入一個 GitHub repository
2. 使用搜尋功能找到特定主題的文章
3. 點擊文章查看詳情

### 場景 2：比較不同來源

1. 先查看本地文章
2. 導入 GitHub repository
3. 使用搜尋比較不同來源的內容

### 場景 3：快速建立知識庫

1. 準備一個包含 markdown 文件的 GitHub repo
2. 使用導入功能一鍵建立網站
3. 分享網站 URL 給團隊

## 進階測試

### 測試 Frontmatter 解析

創建一個測試 repository，包含以下文件：

**有 frontmatter 的文章：**
```markdown
---
title: "測試文章"
date: "2024-12-04"
description: "這是一篇測試文章"
tags: "test, demo"
---

# 內容

這是文章內容。
```

**沒有 frontmatter 的文章：**
```markdown
# 文章標題

這是沒有 frontmatter 的文章。
```

導入後觀察系統如何處理這兩種情況。

### 測試大型 Repository

試試導入包含很多文章的 repository：

1. 觀察載入時間
2. 檢查預覽功能
3. 測試搜尋性能

### 測試錯誤處理

試試這些錯誤情況：

1. **無效的 URL**
   ```
   invalid-url
   ```
   預期：顯示錯誤訊息

2. **不存在的 Repository**
   ```
   https://github.com/nonexistent/repo
   ```
   預期：顯示 "Repository not found"

3. **沒有 Markdown 文件的 Repository**
   ```
   https://github.com/user/empty-repo
   ```
   預期：顯示 "未找到任何 markdown 檔案"

## 性能測試

### 搜尋性能

1. 導入大量文章（50+ 篇）
2. 測試搜尋響應時間
3. 觀察是否有延遲

### 導入性能

1. 導入不同大小的 repositories
2. 記錄載入時間
3. 檢查是否有超時

## 用戶體驗測試

### 響應式設計

1. 在桌面瀏覽器測試
2. 在手機瀏覽器測試
3. 調整視窗大小觀察佈局變化

### 鍵盤導航

1. 使用 Tab 鍵導航
2. 使用 Enter 鍵提交
3. 使用 Escape 鍵關閉對話框

### 錯誤恢復

1. 導入失敗後重試
2. 搜尋無結果後清除
3. 網路錯誤後重新載入

## 截圖建議

建議截取以下畫面：

1. 搜尋功能使用中
2. GitHub 導入對話框
3. 文章預覽列表
4. 導入成功後的文章列表
5. 手機版介面

## 常見問題

### Q: 導入的文章會保存嗎？

A: 目前導入的文章只存在於當前瀏覽器會話中。重新整理頁面後會恢復到本地文章。未來版本會加入 localStorage 支援。

### Q: 可以同時導入多個 repositories 嗎？

A: 目前每次只能導入一個 repository。新的導入會替換之前的內容。

### Q: 搜尋支援正則表達式嗎？

A: 目前不支援。搜尋使用簡單的字串匹配。

### Q: 如何回到本地文章？

A: 重新整理頁面即可回到本地文章。

## 回饋

測試後請記錄：
- 發現的 bug
- 性能問題
- 用戶體驗改進建議
- 新功能想法

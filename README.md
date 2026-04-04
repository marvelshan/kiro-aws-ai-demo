# 靜態部落格系統

一個簡單的靜態部落格系統，使用 Git Submodule 從外部 repository 載入 Markdown 文章。使用 GitHub Pages 和原生 JavaScript 建構，提供快速、穩定的部落格體驗。

## 🌐 線上展示

**網站網址**: 將透過 GitHub Pages 提供服務

透過 GitHub Pages 的內建 CDN 提供快速的訪問體驗。

## 🚀 新架構：Git Submodule

本專案現在使用 **Git Submodule** 來管理文章內容，從 `marvelshan/tech-forum` repository 載入文章。

### 主要優勢

- **⚡ 超快建置**：建置時間從 30-60 秒縮短到 1-5 秒
- **📱 離線支援**：一旦 clone 後可離線建置
- **🔄 版本控制**：完整的內容版本歷史追蹤
- **🛡️ 穩定性**：不受網路和 API 限制影響
- **🤝 團隊協作**：標準 Git 工作流程

### 架構比較

| 特性 | 舊架構 (GitHub API) | 新架構 (Git Submodule) |
|------|-------------------|----------------------|
| 建置時間 | 30-60 秒 | 1-5 秒 |
| 網路依賴 | 每次建置需要 | 僅更新時需要 |
| API 限制 | 受限於 GitHub API | 無限制 |
| 版本控制 | 無法控制版本 | 完整版本控制 |
| 離線支援 | 不支援 | 完全支援 |

## 功能特色

- 使用 Markdown 和 YAML frontmatter 撰寫文章
- 自動掃描和索引文章
- 透過 GitHub Pages CDN 快速全球傳輸
- 安全的 HTTPS 存取
- 響應式設計，支援所有裝置
- 程式碼區塊語法高亮
- 簡潔的介面設計
- 即時文章搜尋功能 - 可搜尋標題、內容和標籤
- 進場動畫 Intro Overlay：網站載入時顯示品牌動畫，顏色與主題一致，完成後以滑動方式揭開頁面
- 文章卡片 Scroll-Reveal：文章列表捲動進入視窗時淡入滑上，提升閱讀體驗

## 架構

```
Tech-Forum Repository (Submodule) → Git Submodule → GitHub Actions → GitHub Pages → 讀者
```

- **Git Submodule**: 從 `marvelshan/tech-forum` 載入文章內容
- **GitHub Pages**: 託管靜態檔案（HTML、CSS、JS、文章）
- **GitHub Actions**: 自動化建置、submodule 更新和部署流程
- **Build Script**: 掃描 submodule 中的 markdown 檔案並產生文章索引
- **Frontend**: 使用原生 JavaScript 的 SPA，負責 markdown 渲染

## 快速開始

### 前置需求

- Node.js 18+ 和 npm
- GitHub 帳戶
- Git

### 1. 設定 Repository

Fork 或 clone 這個 repository：

```bash
# Clone 包含 submodule 的完整專案
git clone --recurse-submodules https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 或者分步驟 clone
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
git submodule init
git submodule update
```

### 2. 安裝相依套件

```bash
npm install
```

### 3. 啟用 GitHub Pages

1. 前往你的 GitHub repository 設定頁面
2. 點選左側選單的「Pages」
3. 在「Source」下選擇「GitHub Actions」
4. 儲存設定

### 4. 更新文章內容

文章內容現在透過 Git Submodule 管理。有三種更新方式：

#### 自動更新（推薦）
系統已設定每日自動更新機制，無需手動操作。

#### 手動更新
```bash
# 更新 submodule 到最新版本
git submodule update --remote articles

# 提交更新
git add articles
git commit -m "更新文章內容到最新版本"
git push origin main
```

#### 在 tech-forum repository 中新增文章
1. 前往 `https://github.com/marvelshan/tech-forum`
2. 新增或修改 markdown 檔案
3. 等待自動更新機制觸發（每日 10:00）

### 5. 部署

推送程式碼到 main branch：

```bash
git add .
git commit -m "Update blog configuration"
git push origin main
```

GitHub Actions 會自動建置並部署你的部落格到 GitHub Pages！

## Git Submodule 管理

### 檢查 Submodule 狀態

```bash
# 檢查 submodule 狀態
git submodule status

# 檢查 submodule 的 commit 資訊
cd articles
git log --oneline -5
cd ..
```

### 更新內容

```bash
# 更新到最新版本
git submodule update --remote articles

# 鎖定特定版本
cd articles
git checkout <commit-hash>
cd ..
git add articles
git commit -m "鎖定文章內容到特定版本"
```

### 自動更新機制

專案包含自動更新 workflow (`.github/workflows/update-submodule.yml`)：

- **每日自動更新**：每天 UTC 02:00 (台灣時間 10:00)
- **手動觸發**：GitHub Actions 頁面可手動執行
- **自動部署**：內容更新後自動重新部署網站

詳細說明請參閱 [Submodule 使用指南](docs/submodule-usage.md)。

## 專案結構

```
.
├── .github/              # GitHub Actions workflows
│   └── workflows/
│       ├── deploy.yml    # 自動化建置和部署到 GitHub Pages
│       └── update-submodule.yml # 自動更新 submodule
├── articles/             # Git Submodule (tech-forum repository)
│   ├── *.md             # Markdown 文章（來自 tech-forum）
│   └── question/        # 子目錄（來自 tech-forum）
├── frontend/             # 前端應用程式（SPA）
│   ├── index.html       # 主要 HTML 模板
│   ├── app.js           # 應用程式邏輯和主控制器
│   ├── router.js        # 客戶端路由（hash-based）
│   ├── search.js        # 搜尋功能
│   ├── github-importer.js # GitHub repository 資訊顯示
│   ├── styles.css       # 響應式樣式
│   └── intro.css        # 進場動畫 Overlay 樣式與 Scroll-Reveal
├── scripts/             # 建置和部署腳本
│   ├── build.js         # 主要建置協調器（使用 submodule）
│   ├── scanner.js       # 掃描 articles/ 目錄中的 .md 檔案
│   ├── parser.js        # 解析 markdown 的 YAML frontmatter
│   ├── generator.js     # 產生 articles/list.json 索引
│   └── deploy.js        # 建置靜態檔案
├── tests/               # 測試檔案
│   ├── markdown-parser.test.js
│   ├── article-detail.test.js
│   └── error-handling.test.js
├── docs/                # 文件
│   ├── content-import-comparison.md # GitHub API vs Submodule 比較
│   ├── submodule-usage.md          # Submodule 使用指南
│   └── *.md            # 其他文件
├── dist/               # 建置輸出（自動產生）
│   ├── index.html
│   ├── *.js, *.css
│   ├── .nojekyll       # GitHub Pages 設定檔
│   └── articles/
│       ├── list.json   # 產生的文章索引
│       └── *.md        # 複製的 markdown 檔案
├── .gitmodules         # Git submodule 設定
├── .nojekyll           # 防止 GitHub Pages 使用 Jekyll 處理
├── package.json        # Node.js 相依套件和腳本
└── README.md           # 本檔案
```

### 主要目錄說明

- **articles/**: Git Submodule，包含來自 `marvelshan/tech-forum` 的文章內容
- **frontend/**: 客戶端應用程式程式碼。修改此處以變更 UI/UX
- **scripts/**: 建置自動化。現在使用本地 submodule 而非 GitHub API
- **.github/workflows/**: GitHub Actions 自動化部署和 submodule 更新
- **docs/**: 包含架構比較和使用指南
- **tests/**: 自動化測試
- **dist/**: 建置時產生。請勿手動編輯

## 開發

### 本地開發

在本地建置專案：

```bash
npm run build
```

在本地提供服務（需要 http-server 或類似工具）：

```bash
npx http-server dist
```

### 執行測試

```bash
npm test
```

開發時的 watch 模式：

```bash
npm run test:watch
```

## 新功能

### 搜尋功能

使用頁面頂部的搜尋列快速尋找文章：
- 可搜尋標題、內容、標籤或描述
- 即時顯示搜尋結果
- 結果依相關性排序

## 撰寫文章

### 如何新增文章

1. **在 `articles/` 目錄中建立 markdown 檔案**：
   ```bash
   touch articles/my-new-article.md
   ```

2. **在檔案開頭加入 frontmatter**（建議）：
   ```yaml
   ---
   title: "我的新文章"
   date: "2024-12-05"
   description: "簡短描述這篇文章的內容"
   tags: ["教學", "javascript"]
   ---
   ```

3. **使用標準 markdown 語法撰寫內容**

4. **建置並部署**：
   ```bash
   npm run deploy
   ```

你的文章會自動出現在部落格中！

### Frontmatter 格式

```yaml
---
title: "文章標題"              # 必填 - 顯示為文章標題
date: "2024-12-04"            # 必填 - ISO 8601 格式（YYYY-MM-DD）
description: "簡短摘要"        # 選填 - 顯示在文章列表中
tags: ["標籤1", "標籤2"]       # 選填 - 用於分類和搜尋
---
```

**重要注意事項：**
- Frontmatter 必須在檔案的最開頭
- 使用有效的 YAML 語法（正確的縮排，特殊字元需加引號）
- 日期格式必須是 `YYYY-MM-DD`
- Tags 應該是字串陣列

### Fallback 行為（無 Frontmatter）

如果你沒有加入 frontmatter，系統會：
- 使用**檔案名稱**（不含 .md）作為標題
- 使用**檔案修改時間**作為日期
- 描述和標籤留空

範例：`my-article.md` → 標題：「my-article」

### Markdown 支援

我們的部落格支援所有標準 markdown 功能：

**文字格式：**
- **粗體** 使用 `**文字**` 或 `__文字__`
- *斜體* 使用 `*文字*` 或 `_文字_`
- ~~刪除線~~ 使用 `~~文字~~`

**標題：**
```markdown
# H1 標題
## H2 標題
### H3 標題
```

**清單：**
```markdown
- 無序項目
- 另一個項目
  - 巢狀項目

1. 有序項目
2. 另一個項目
```

**程式碼：**
- 行內：`` `code` ``
- 區塊：使用三個反引號並指定語言以啟用語法高亮

````markdown
```javascript
function hello() {
  console.log("Hello, world!");
}
```
````

**連結和圖片：**
```markdown
[連結文字](https://example.com)
![替代文字](image-url.jpg)
```

**表格：**
```markdown
| 標題 1 | 標題 2 |
|--------|--------|
| 儲存格 1 | 儲存格 2 |
```

**引用：**
```markdown
> 這是一段引用
```

完整範例請參閱 `articles/comprehensive-markdown-guide.md`。

### 檔案命名最佳實踐

- **使用 `.md` 副檔名** - 自動發現所需
- **使用 kebab-case** - `my-article-title.md`（小寫加連字號）
- **避免空格** - 使用連字號代替：`my article.md` ❌ → `my-article.md` ✅
- **使用描述性名稱** - 檔案名稱會成為 URL slug：`getting-started-guide.md`
- **避免特殊字元** - 只使用字母、數字和連字號

### 組織文章

所有文章都放在 `articles/` 目錄中。系統會：
- 自動掃描所有 `.md` 檔案
- 忽略隱藏檔案（以 `.` 開頭）
- 依日期排序（最新的在前）
- 在建置時產生索引

如有需要，你可以使用子目錄組織，掃描器會遞迴尋找它們。

### 在本地測試文章

1. 將文章加入 `articles/`
2. 建置專案：`npm run build`
3. 在本地提供服務：`npx http-server dist`
4. 在瀏覽器開啟 `http://localhost:8080`
5. 驗證格式、連結和圖片是否正常運作

### 常見問題

**文章沒有出現？**
- 檢查 frontmatter YAML 語法（使用 YAML 驗證器）
- 確保檔案有 `.md` 副檔名
- 重新建置：`npm run build`

**日期格式錯誤？**
- 使用 ISO 8601：`YYYY-MM-DD`（例如：`2024-12-05`）
- 不要使用 `12/05/2024` 或其他格式

**程式碼沒有高亮？**
- 在開頭反引號後指定語言：` ```javascript `
- 支援的語言：javascript、python、typescript、bash、json、html、css 等

**圖片無法載入？**
- 外部圖片使用絕對網址
- 本地圖片放在 `frontend/` 並使用相對路徑參照
- 新增圖片後重新建置並部署

## 部署

### 自動化 CI/CD（GitHub Actions）

專案包含 GitHub Actions workflow，會在每次推送到 main branch 時自動建置和部署到 GitHub Pages。

#### GitHub Actions Workflow

workflow 檔案位於 `.github/workflows/deploy.yml`，包含以下步驟：

1. **Checkout code** - 取得 repository 程式碼
2. **Setup Node.js** - 安裝 Node.js 20 並啟用 npm 快取
3. **Install dependencies** - 執行 `npm ci` 進行乾淨安裝
4. **Run tests** - 執行所有測試確保程式碼品質
5. **Build static files** - 產生文章列表並打包前端
6. **Setup Pages** - 配置 GitHub Pages 環境
7. **Upload artifact** - 上傳建置輸出到 GitHub Pages
8. **Deploy to GitHub Pages** - 部署到 GitHub Pages

#### 設定 GitHub Pages

1. **啟用 GitHub Pages**
   - 前往 repository 設定 → Pages
   - Source 選擇「GitHub Actions」
   - 儲存設定

2. **Workflow 觸發條件**
   - 推送到 `main` branch（自動建置和部署）
   - 手動觸發（透過 GitHub Actions UI）

3. **部署流程**
   ```bash
   # 新增或修改文章
   git add articles/my-new-article.md
   git commit -m "Add new article"
   git push origin main
   
   # GitHub Actions 會自動：
   # 1. 執行測試
   # 2. 建置靜態檔案
   # 3. 部署到 GitHub Pages
   ```

### 手動部署

#### 本地建置測試

在推送前測試建置：

```bash
npm run build
```

在本地提供服務測試：

```bash
npx http-server dist
```

#### 手動觸發部署

可以透過 GitHub Actions UI 手動觸發部署：
1. 前往 repository → Actions
2. 選擇「Build and Deploy to GitHub Pages」workflow
3. 點擊「Run workflow」

## 設定

### GitHub Pages 設定

- 靜態檔案透過 GitHub Pages CDN 提供服務
- 自動 HTTPS 支援
- 全球 CDN 快取提供快速存取
- `.nojekyll` 檔案防止 Jekyll 處理

### 快取設定

GitHub Pages 自動處理：
- 靜態資源快取最佳化
- 自動 Gzip 壓縮
- 全球 CDN 分發

### 安全性

- 強制 HTTPS（GitHub Pages 內建）
- 安全的 GitHub Actions 部署流程
- 無需管理伺服器或資料庫安全性

## 成本最佳化

- GitHub Pages 完全免費（公開 repository）
- 無需支付託管或 CDN 費用
- 無需維護伺服器基礎設施
- 自動擴展和高可用性

## 疑難排解

### 建置失敗

檢查是否已安裝所有相依套件：
```bash
npm install
```

檢查 GitHub Actions logs：
1. 前往 repository → Actions
2. 點選失敗的 workflow run
3. 查看詳細錯誤訊息

### 部署失敗

確保已啟用 GitHub Pages：
1. 前往 repository 設定 → Pages
2. Source 選擇「GitHub Actions」
3. 儲存設定

檢查 workflow 權限：
- 確保 Actions 有 Pages 寫入權限
- 檢查 repository 設定 → Actions → General

### 文章未顯示

- 檢查 frontmatter 格式（有效的 YAML）
- 確保檔案在 `articles/` 目錄中
- 推送變更並等待 GitHub Actions 完成部署
- 檢查 GitHub Pages 部署狀態

### 404 錯誤

- 等待 GitHub Actions 部署完成（通常 1-2 分鐘）
- 檢查 GitHub Pages 設定是否正確
- 確認 `dist/index.html` 檔案存在
- 檢查 `.nojekyll` 檔案是否存在

### GitHub Actions 權限問題

如果遇到權限錯誤：
1. 前往 repository 設定 → Actions → General
2. 在「Workflow permissions」選擇「Read and write permissions」
3. 勾選「Allow GitHub Actions to create and approve pull requests」
4. 儲存設定

## 腳本參考

- `npm run build` - 在本地建置專案
- `npm run deploy` - 建置靜態檔案（GitHub Actions 處理實際部署）
- `npm test` - 執行測試
- `npm run test:watch` - 以 watch 模式執行測試

## 授權

MIT

## 貢獻

1. Fork repository
2. 建立 feature branch
3. 進行變更
4. 執行測試：`npm test`
5. 提交 pull request

## 支援

如有問題：
- 查看疑難排解章節
- 檢查 GitHub Actions workflow logs
- 查看 GitHub Pages 部署狀態
- 在 GitHub 開啟 issue

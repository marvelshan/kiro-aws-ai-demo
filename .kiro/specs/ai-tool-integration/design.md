# Design Document

## Overview

本系統是一個基於 AWS 的靜態部落格網站，用於展示 Git repository 中的 Markdown 文章。系統採用 serverless 架構，使用 AWS S3 託管靜態網站，搭配 CloudFront 作為 CDN，並透過簡單的前端框架來渲染 Markdown 內容。

核心設計理念：
- 簡單易維護：最小化基礎設施複雜度
- 自動化部署：透過 Git 提交自動更新內容
- 成本效益：使用 serverless 服務降低運營成本
- 良好體驗：快速載入和響應式設計

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   Reader    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────┐
│   CloudFront    │ (CDN)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   S3 Bucket     │ (Static Website Hosting)
│                 │
│  ├─ index.html  │
│  ├─ app.js      │
│  ├─ styles.css  │
│  └─ articles/   │
│     ├─ *.md     │
│     └─ list.json│
└─────────────────┘
```

### Deployment Flow

```
┌──────────────┐
│  Git Commit  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ GitHub Actions│
│  or CI/CD    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Build Script│
│ - Scan .md   │
│ - Generate   │
│   list.json  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  AWS S3 Sync │
└──────────────┘
```

## Components and Interfaces

### 1. Frontend Application (SPA)

單頁應用程式，負責渲染使用者介面和處理路由。

**技術選擇：** Vanilla JavaScript 或輕量級框架（如 Vue.js）

**主要職責：**
- 路由管理（文章列表 / 文章詳細頁面）
- 從 S3 載入文章列表和內容
- Markdown 轉 HTML 渲染
- 響應式 UI 呈現

**關鍵檔案：**
- `index.html` - 主要 HTML 模板
- `app.js` - 應用程式邏輯
- `styles.css` - 樣式表

### 2. Article List Generator

建置時執行的腳本，掃描 markdown 檔案並生成文章索引。

**技術選擇：** Node.js 或 Python

**主要職責：**
- 掃描指定目錄的 .md 檔案
- 解析 frontmatter metadata
- 生成 `articles/list.json` 索引檔案
- 複製文章到部署目錄

**輸出格式 (list.json)：**
```json
{
  "articles": [
    {
      "id": "article-slug",
      "title": "文章標題",
      "date": "2024-12-04",
      "filename": "article-slug.md"
    }
  ]
}
```

### 3. Markdown Parser

前端使用的 Markdown 解析庫。

**技術選擇：** marked.js 或 markdown-it

**主要職責：**
- 將 Markdown 轉換為 HTML
- 支援程式碼語法高亮（搭配 highlight.js）
- 處理圖片、連結等元素

### 4. AWS Infrastructure

**S3 Bucket：**
- 啟用靜態網站託管
- 設定 index.html 為預設文件
- 配置適當的 CORS 和 bucket policy

**CloudFront Distribution：**
- 作為 S3 的 CDN
- 提供 HTTPS 支援
- 快取靜態資源
- 設定自訂網域（可選）

## Data Models

### Article Metadata

```typescript
interface ArticleMetadata {
  id: string;           // 文章唯一識別碼（通常是檔案名稱）
  title: string;        // 文章標題
  date: string;         // 發布日期 (ISO 8601 格式)
  filename: string;     // Markdown 檔案名稱
  description?: string; // 可選的文章摘要
  tags?: string[];      // 可選的標籤
}
```

### Article List

```typescript
interface ArticleList {
  articles: ArticleMetadata[];
}
```

### Frontmatter Format

Markdown 檔案開頭的 YAML frontmatter：

```yaml
---
title: "文章標題"
date: "2024-12-04"
description: "文章摘要"
tags: ["tag1", "tag2"]
---
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, I've identified properties that can be combined and redundancies that should be eliminated:

**Property Reflection:**
- Properties 3.1, 3.2, 3.3, 3.4 all test markdown parsing for different elements. These can be combined into a single comprehensive markdown parsing property.
- Properties 2.2 and 2.3 both test markdown rendering and can be combined.
- Properties 4.1, 4.2, and 4.5 all relate to file scanning and can be consolidated.

**Property 1: Article list contains required metadata**
*For any* article in the displayed article list, the article entry should contain both a title field and a date field.
**Validates: Requirements 1.2**

**Property 2: Article list sorted by date**
*For any* article list, the articles should be ordered by publication date from newest to oldest.
**Validates: Requirements 1.3**

**Property 3: Article navigation generates correct URL**
*For any* article with a given ID, clicking the article title should navigate to a URL containing that article's ID.
**Validates: Requirements 2.1**

**Property 4: Markdown to HTML conversion preserves structure**
*For any* valid markdown content containing standard elements (headings, lists, code blocks, links, images), the HTML output should contain corresponding HTML tags that preserve the semantic structure.
**Validates: Requirements 2.2, 2.3, 3.1, 3.2, 3.3, 3.4**

**Property 5: Article detail page displays metadata**
*For any* article, the rendered detail page HTML should contain the article's title and publication date.
**Validates: Requirements 2.4**

**Property 6: File scanner finds all markdown files**
*For any* directory containing markdown files (with .md extension), the scanner should return all non-hidden markdown files and exclude all non-markdown files.
**Validates: Requirements 4.1, 4.2, 4.5**

**Property 7: Frontmatter parser extracts metadata**
*For any* markdown file with valid YAML frontmatter, the parser should correctly extract the title and date fields from the frontmatter.
**Validates: Requirements 4.3**

**Property 8: Fallback metadata generation**
*For any* markdown file without frontmatter, the system should use the filename as the title and the file modification time as the date.
**Validates: Requirements 4.4**

## Error Handling

### Client-Side Error Scenarios

1. **Article Not Found**
   - When: 請求的文章 ID 不存在
   - Response: 顯示 404 頁面，提供返回首頁的連結
   - User Message: "找不到此文章，可能已被移除"

2. **Network Error**
   - When: 無法從 S3 載入文章列表或內容
   - Response: 顯示錯誤訊息，提供重試按鈕
   - User Message: "載入失敗，請檢查網路連線"

3. **Markdown Parse Error**
   - When: Markdown 內容格式異常
   - Response: 顯示原始內容或錯誤訊息
   - User Message: "文章格式解析失敗"
   - Logging: 記錄錯誤詳情到 console

4. **Empty Article List**
   - When: list.json 為空或不存在
   - Response: 顯示友善的空狀態
   - User Message: "目前還沒有文章"

### Build-Time Error Scenarios

1. **Invalid Frontmatter**
   - When: YAML frontmatter 格式錯誤
   - Response: 使用 fallback metadata，記錄警告
   - Logging: 輸出檔案名稱和錯誤原因

2. **Missing Required Fields**
   - When: frontmatter 缺少 title 或 date
   - Response: 使用 fallback 值
   - Logging: 警告訊息

3. **File Read Error**
   - When: 無法讀取 markdown 檔案
   - Response: 跳過該檔案，繼續處理其他檔案
   - Logging: 錯誤訊息包含檔案路徑

## Testing Strategy

### Unit Testing

**Frontend Components:**
- Article list rendering component
- Article detail rendering component
- Router logic
- Markdown parser integration

**Build Scripts:**
- File scanner function
- Frontmatter parser
- Article list generator
- Metadata extraction logic

**Test Framework:** Jest 或 Vitest

### Property-Based Testing

Property-based tests will verify universal properties across many randomly generated inputs.

**Test Framework:** fast-check (JavaScript)

**Configuration:** Each property test should run minimum 100 iterations.

**Test Tagging:** Each property-based test must include a comment with the format:
`// Feature: ai-tool-integration, Property {number}: {property_text}`

**Properties to Test:**

1. **Article Metadata Completeness** (Property 1)
   - Generate: Random article lists with varying metadata
   - Verify: All articles have title and date fields

2. **Date Sorting** (Property 2)
   - Generate: Random article lists with random dates
   - Verify: List is sorted newest to oldest

3. **URL Generation** (Property 3)
   - Generate: Random article IDs
   - Verify: Generated URLs contain the article ID

4. **Markdown Conversion** (Property 4)
   - Generate: Random markdown with various elements
   - Verify: Output HTML contains expected tags

5. **Metadata Display** (Property 5)
   - Generate: Random article metadata
   - Verify: Rendered HTML contains title and date

6. **File Scanning** (Property 6)
   - Generate: Mock directory structures with mixed files
   - Verify: Only .md files (non-hidden) are returned

7. **Frontmatter Parsing** (Property 7)
   - Generate: Random valid YAML frontmatter
   - Verify: Extracted metadata matches input

8. **Fallback Metadata** (Property 8)
   - Generate: Markdown files without frontmatter
   - Verify: Filename used as title, file time as date

### Integration Testing

- End-to-end test: 從文章列表導航到文章詳細頁面
- Build process test: 完整的建置流程從掃描到生成
- S3 deployment test: 驗證檔案正確上傳到 S3

### Manual Testing Checklist

- 響應式設計在不同裝置上的表現
- 各種 markdown 語法的渲染效果
- 程式碼語法高亮的正確性
- 圖片載入和顯示
- 導航流暢度

## Deployment Strategy

### Infrastructure as Code

使用 AWS CDK (TypeScript) 定義基礎設施：

```typescript
// 主要資源
- S3 Bucket (靜態網站託管)
- CloudFront Distribution
- Route53 (可選，用於自訂網域)
- ACM Certificate (可選，用於 HTTPS)
```

### CI/CD Pipeline

**觸發條件：** Push to main branch

**Pipeline Steps：**
1. Checkout code
2. Install dependencies
3. Run tests (unit + property-based)
4. Build: 執行文章掃描和列表生成
5. Build: 打包前端資源
6. Deploy: Sync to S3
7. Invalidate CloudFront cache

**工具選擇：** GitHub Actions 或 AWS CodePipeline

### Build Script Workflow

```bash
# 1. 掃描 markdown 檔案
node scripts/scan-articles.js

# 2. 生成 articles/list.json
# 3. 複製文章到 dist/articles/
# 4. 複製前端資源到 dist/

# 5. 部署到 S3
aws s3 sync dist/ s3://bucket-name/ --delete

# 6. 清除 CloudFront 快取
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

## Performance Considerations

### Frontend Optimization

- **Code Splitting:** 按需載入 markdown parser
- **Lazy Loading:** 文章列表分頁或無限滾動
- **Caching:** 利用瀏覽器快取和 Service Worker
- **Minification:** 壓縮 JS 和 CSS

### CDN Configuration

- **Cache Headers:** 設定適當的 Cache-Control
- **Compression:** 啟用 Gzip/Brotli 壓縮
- **Edge Locations:** 選擇適當的地理位置

### Asset Optimization

- **Images:** 壓縮圖片，使用適當格式
- **Fonts:** 使用系統字體或優化 web fonts
- **CSS:** 移除未使用的樣式

## Security Considerations

### S3 Bucket Security

- 啟用 bucket versioning
- 設定適當的 bucket policy（僅允許 CloudFront 存取）
- 禁用公開存取（透過 CloudFront 提供內容）
- 啟用 access logging

### CloudFront Security

- 強制 HTTPS
- 設定 Origin Access Identity (OAI)
- 配置 WAF rules（可選）
- 設定適當的 CORS headers

### Content Security

- 實作 Content Security Policy (CSP) headers
- 防止 XSS：sanitize markdown 輸出
- 驗證上傳的 markdown 檔案

## Monitoring and Logging

### CloudWatch Metrics

- CloudFront 請求數和錯誤率
- S3 bucket 存取統計
- Lambda 執行時間（如果使用）

### Logging

- CloudFront access logs
- S3 access logs
- Application errors (前端 console errors)

### Alerts

- 4xx/5xx 錯誤率過高
- CloudFront 快取命中率過低
- 異常流量模式

## Future Enhancements

可能的功能擴充（不在當前 scope）：

1. **搜尋功能：** 全文搜尋文章內容
2. **標籤系統：** 按標籤篩選文章
3. **RSS Feed：** 提供 RSS 訂閱
4. **評論系統：** 整合第三方評論服務
5. **分析追蹤：** Google Analytics 或類似服務
6. **深色模式：** 主題切換功能
7. **多語言支援：** i18n 國際化

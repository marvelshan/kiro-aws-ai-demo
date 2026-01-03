# Requirements Document

## Introduction

將現有的 AWS S3 + CloudFront 靜態部落格系統轉換為使用 GitHub Pages 託管的個人部落格網站。移除 AWS 基礎設施依賴，簡化部署流程，並整合從指定 GitHub Repository (`https://github.com/marvelshan/tech-forum`) 自動抓取文章內容的功能。

## Glossary

- **Blog_System**: 整個部落格應用程式，包含前端和建置腳本
- **GitHub_Pages**: GitHub 提供的免費靜態網站託管服務
- **Build_Process**: 掃描 markdown 文章並產生靜態網站的自動化流程
- **Article_Index**: 包含所有文章 metadata 的 JSON 檔案
- **Frontend_App**: 使用原生 JavaScript 的單頁應用程式
- **Deployment_Workflow**: GitHub Actions 自動化部署流程
- **GitHub_Content_Fetcher**: 從指定 GitHub Repository 抓取 markdown 內容的模組

## Requirements

### Requirement 1: GitHub Pages 基礎設施轉換

**User Story:** 作為部落格擁有者，我想要使用 GitHub Pages 託管我的部落格，這樣我就不需要維護 AWS 服務和相關費用。

#### Acceptance Criteria

1. WHEN 專案部署到 GitHub Pages THEN THE Blog_System SHALL 透過 GitHub Pages URL 提供服務
2. WHEN 使用者訪問部落格 THEN THE Blog_System SHALL 提供 HTTPS 存取
3. THE Build_Process SHALL 產生適合 GitHub Pages 的靜態檔案結構
4. THE Deployment_Workflow SHALL 自動部署到 GitHub Pages 而非 AWS S3
5. THE Blog_System SHALL 移除所有 AWS CDK 和相關基礎設施程式碼

### Requirement 2: 保持現有核心功能

**User Story:** 作為部落格讀者，我想要繼續使用所有現有的部落格功能，包括文章瀏覽、搜尋和響應式設計。

#### Acceptance Criteria

1. WHEN 使用者瀏覽部落格 THEN THE Frontend_App SHALL 顯示所有現有文章
2. WHEN 使用者使用搜尋功能 THEN THE Blog_System SHALL 提供即時文章搜尋
3. WHEN 使用者在不同裝置上訪問 THEN THE Frontend_App SHALL 提供響應式設計
4. WHEN 文章包含程式碼區塊 THEN THE Blog_System SHALL 提供語法高亮
5. THE Frontend_App SHALL 支援 markdown 渲染和 YAML frontmatter 解析

### Requirement 3: 整合指定 GitHub Repository 內容抓取

**User Story:** 作為部落格擁有者，我想要自動從指定的 GitHub repository (`https://github.com/marvelshan/tech-forum`) 抓取文章內容，這樣我就能集中管理文章並自動同步到部落格。

#### Acceptance Criteria

1. WHEN 建置過程執行 THEN THE Build_Process SHALL 從 `https://github.com/marvelshan/tech-forum` 抓取所有 markdown 檔案
2. THE Build_Process SHALL 使用 GitHub API 遞迴掃描 repository 中的所有 markdown 檔案
3. WHEN 抓取到 markdown 檔案 THEN THE Build_Process SHALL 解析 YAML frontmatter 並產生文章索引
4. THE Build_Process SHALL 將抓取的文章內容快取到 dist/articles/ 目錄
5. WHEN GitHub repository 內容更新 THEN THE Blog_System SHALL 在下次建置時反映最新內容

### Requirement 4: 簡化建置和部署流程

**User Story:** 作為部落格擁有者，我想要有一個簡單的部署流程，只需要推送程式碼到 GitHub 就能自動更新部落格。

#### Acceptance Criteria

1. WHEN 程式碼推送到 main branch THEN THE Deployment_Workflow SHALL 自動建置並部署到 GitHub Pages
2. THE Build_Process SHALL 產生所有必要的靜態檔案到適當的輸出目錄
3. THE Deployment_Workflow SHALL 移除所有 AWS 相關的部署步驟
4. WHEN 部署完成 THEN THE Blog_System SHALL 在 GitHub Pages URL 上可用
5. THE Build_Process SHALL 維持現有的文章索引產生功能

### Requirement 5: 設定檔案和文件更新

**User Story:** 作為開發者，我想要更新所有相關的設定檔案和文件，以反映新的 GitHub Pages 架構。

#### Acceptance Criteria

1. THE Blog_System SHALL 更新 package.json 腳本以移除 AWS CDK 相關指令
2. THE Blog_System SHALL 更新 README.md 以反映 GitHub Pages 部署流程
3. THE Blog_System SHALL 移除 infrastructure/ 目錄和所有 AWS 相關檔案
4. THE Blog_System SHALL 更新 GitHub Actions workflow 以支援 GitHub Pages 部署
5. WHEN 開發者查看文件 THEN THE Blog_System SHALL 提供清楚的 GitHub Pages 設定指南

### Requirement 6: 本地開發環境保持不變

**User Story:** 作為開發者，我想要保持現有的本地開發體驗，包括建置和測試功能。

#### Acceptance Criteria

1. WHEN 開發者執行 `npm run build` THEN THE Build_Process SHALL 在本地產生靜態檔案
2. WHEN 開發者執行 `npm test` THEN THE Blog_System SHALL 執行所有現有測試
3. THE Build_Process SHALL 維持現有的 articles/ 掃描和索引產生功能
4. WHEN 開發者在本地提供服務 THEN THE Frontend_App SHALL 正常運作
5. THE Blog_System SHALL 保持現有的專案結構（除了移除 infrastructure/ 目錄）

### Requirement 7: 效能和 SEO 最佳化

**User Story:** 作為部落格讀者，我想要快速載入的部落格頁面和良好的搜尋引擎最佳化。

#### Acceptance Criteria

1. THE Frontend_App SHALL 產生適當的 meta tags 用於 SEO
2. WHEN GitHub Pages 提供靜態檔案 THEN THE Blog_System SHALL 利用 GitHub Pages 的 CDN 快取
3. THE Build_Process SHALL 最佳化靜態資源（CSS、JS）的載入
4. THE Frontend_App SHALL 支援適當的 URL 結構用於文章連結
5. WHEN 搜尋引擎爬蟲訪問 THEN THE Blog_System SHALL 提供可索引的內容
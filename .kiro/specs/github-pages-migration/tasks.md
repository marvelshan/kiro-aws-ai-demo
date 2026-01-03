# Implementation Plan: GitHub Pages Migration

## Overview

將現有的 AWS 靜態部落格系統轉換為使用 GitHub Pages 託管的個人部落格網站，並整合從指定 GitHub Repository (`https://github.com/marvelshan/tech-forum`) 自動抓取文章內容的功能。這個實作將分階段進行，先清理 AWS 相關程式碼，然後設定 GitHub Pages 部署，最後實作 GitHub 內容抓取功能。

## Tasks

- [x] 1. 清理 AWS 基礎設施和相關程式碼
  - 移除 infrastructure/ 目錄和所有 AWS CDK 程式碼
  - 更新 package.json 移除 AWS 相關腳本和依賴
  - 移除現有的 AWS 部署腳本邏輯
  - _Requirements: 1.5, 4.3, 5.1, 5.3_

- [ ]* 1.1 寫屬性測試驗證 AWS 清理完整性
  - **Property 1: AWS 清理完整性**
  - **Validates: Requirements 1.5, 4.3, 5.1, 5.3**

- [x] 2. 設定 GitHub Pages 部署基礎設施
  - 創建 GitHub Actions workflow 檔案
  - 配置自動化建置和部署流程
  - 確保建置輸出符合 GitHub Pages 要求
  - _Requirements: 1.1, 1.4, 4.1, 4.4_

- [ ]* 2.1 寫屬性測試驗證建置輸出完整性
  - **Property 2: 建置輸出完整性**
  - **Validates: Requirements 1.3, 4.2**

- [ ] 3. 更新建置腳本適應 GitHub Pages
  - 修改 scripts/deploy.js 移除 AWS S3 同步邏輯
  - 確保建置過程產生正確的靜態檔案結構
  - 保持現有的文章掃描和索引產生功能
  - _Requirements: 1.3, 4.2, 4.5, 6.3_

- [ ]* 3.1 寫屬性測試驗證文章處理一致性
  - **Property 3: 文章處理一致性**
  - **Validates: Requirements 2.1, 3.3, 3.4, 4.5, 6.3**

- [ ] 4. 檢查點 - 確保基礎建置和部署正常運作
  - 確保所有測試通過，詢問使用者是否有問題

- [ ] 5. 實作從指定 GitHub Repository 抓取文章功能
  - 修改建置腳本從 `https://github.com/marvelshan/tech-forum` 抓取 markdown 檔案
  - 實作 GitHub API 整合以獲取 repository 內容
  - 更新文章掃描邏輯以處理遠端 GitHub 內容而非本地 articles/ 目錄
  - 確保 frontmatter 解析和文章索引產生正常運作
  - 在建置時下載並快取 GitHub 內容到 dist/articles/
  - _Requirements: 2.1, 4.5, 6.3_

- [ ]* 5.1 寫屬性測試驗證 GitHub 內容抓取功能
  - **Property 5: GitHub 內容抓取一致性**
  - **Validates: Requirements 2.1, 4.5, 6.3**

- [ ] 5.2 更新前端 UI 以支援 GitHub 內容顯示
  - 修改 frontend/github-importer.js 預設指向 `marvelshan/tech-forum`
  - 更新 UI 文字和說明以反映新的內容來源
  - 確保文章列表和詳細頁面正確顯示 GitHub 內容
  - 添加適當的錯誤處理和載入狀態
  - _Requirements: 2.2, 2.4_

- [ ] 6. 驗證核心功能保持正常
  - 測試文章瀏覽功能
  - 測試搜尋功能
  - 測試 markdown 渲染和語法高亮
  - _Requirements: 2.2, 2.4, 2.5_

- [ ]* 6.1 寫屬性測試驗證核心功能保持性
  - **Property 4: 核心功能保持性**
  - **Validates: Requirements 2.2, 2.4, 2.5**

- [ ] 7. 實作 HTTPS 和 SEO 最佳化
  - 確保所有連結使用 HTTPS
  - 在 HTML 模板中加入適當的 meta tags
  - 最佳化靜態資源載入
  - _Requirements: 1.2, 7.1, 7.3, 7.4, 7.5_

- [ ]* 7.1 寫屬性測試驗證 HTTPS 存取保證
  - **Property 6: HTTPS 存取保證**
  - **Validates: Requirements 1.2**

- [ ]* 7.2 寫屬性測試驗證 SEO 最佳化
  - **Property 7: SEO 最佳化**
  - **Validates: Requirements 7.1, 7.3, 7.4, 7.5**

- [ ] 8. 更新文件和設定
  - 更新 README.md 反映 GitHub Pages 部署流程
  - 移除 AWS 相關文件
  - 更新專案描述和使用說明
  - _Requirements: 5.2, 5.4, 5.5_

- [ ] 9. 本地開發環境驗證
  - 確保 `npm run build` 在本地正常運作
  - 確保 `npm test` 執行所有測試
  - 驗證本地開發伺服器功能
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ] 10. 最終檢查點 - 完整系統測試
  - 確保所有測試通過，詢問使用者是否有問題

## Notes

- 任務標記 `*` 的為可選測試任務，可以跳過以加快 MVP 開發
- 每個任務都參照具體的需求以確保可追溯性
- 檢查點確保增量驗證
- 屬性測試驗證通用正確性屬性
- 單元測試驗證具體範例和邊界情況
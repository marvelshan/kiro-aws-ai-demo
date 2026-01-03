# Design Document: GitHub Pages Migration

## Overview

將現有的 AWS S3 + CloudFront 靜態部落格系統轉換為使用 GitHub Pages 託管的個人部落格網站。這個轉換將簡化基礎設施，降低維護成本，並提供更直接的部署流程。

### 核心設計原則

1. **簡化優先**: 移除複雜的 AWS 基礎設施，使用 GitHub Pages 的內建功能
2. **功能保持**: 保留所有現有的核心部落格功能
3. **自動化部署**: 透過 GitHub Actions 實現推送即部署
4. **個人化**: 移除通用的 GitHub 匯入功能，專注於個人部落格

## Architecture

### 新架構概覽

```
Git Repository → GitHub Actions → GitHub Pages → 讀者
```

**主要變更：**
- **移除**: AWS S3, CloudFront, CDK 基礎設施
- **新增**: GitHub Actions workflow, GitHub Pages 設定
- **保持**: 前端 SPA, 建置腳本, 文章管理

### 架構比較

| 組件 | 舊架構 (AWS) | 新架構 (GitHub Pages) |
|------|-------------|---------------------|
| 託管 | S3 + CloudFront | GitHub Pages |
| 部署 | AWS CLI + CDK | GitHub Actions |
| CDN | CloudFront | GitHub Pages CDN |
| HTTPS | CloudFront | GitHub Pages 內建 |
| 成本 | AWS 費用 | 免費 |

## Components and Interfaces

### 1. GitHub Pages 設定

**目的**: 配置 repository 使用 GitHub Pages 託管
**實作方式**: 
- 在 repository 設定中啟用 GitHub Pages
- 設定部署來源為 GitHub Actions
- 配置自訂網域（如需要）

### 2. GitHub Actions Workflow

**目的**: 自動化建置和部署流程
**觸發條件**: 推送到 main branch
**主要步驟**:
1. Checkout 程式碼
2. 設定 Node.js 環境
3. 安裝相依套件
4. 執行測試
5. 建置靜態檔案
6. 部署到 GitHub Pages

### 3. 建置系統更新

**目的**: 調整現有建置腳本以適應 GitHub Pages
**主要變更**:
- 確保輸出目錄結構符合 GitHub Pages 要求
- 移除 AWS 相關的部署邏輯
- 保持文章掃描和索引產生功能

### 4. 前端應用程式清理

**目的**: 移除不需要的功能，專注於個人部落格
**主要變更**:
- 移除 `github-importer.js` 和相關 UI
- 簡化導航和介面
- 保持所有核心功能（搜尋、文章瀏覽、響應式設計）

## Data Models

### 文章資料結構（保持不變）

```javascript
{
  "title": "文章標題",
  "date": "2024-01-01",
  "description": "文章描述",
  "tags": ["標籤1", "標籤2"],
  "filename": "article-filename.md",
  "content": "markdown 內容"
}
```

### 文章索引結構（保持不變）

```javascript
{
  "articles": [
    {
      "title": "文章標題",
      "date": "2024-01-01", 
      "description": "文章描述",
      "tags": ["標籤1", "標籤2"],
      "filename": "article-filename.md"
    }
  ],
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: AWS 清理完整性
*For any* 程式碼庫掃描，不應該包含任何 AWS CDK、S3、CloudFront 相關的程式碼、設定檔案或目錄
**Validates: Requirements 1.5, 4.3, 5.1, 5.3**

### Property 2: 建置輸出完整性
*For any* 建置執行，輸出目錄應該包含所有必要的靜態檔案（HTML、CSS、JS、文章索引），且結構符合 GitHub Pages 要求
**Validates: Requirements 1.3, 4.2**

### Property 3: 文章處理一致性
*For any* articles/ 目錄中的有效 markdown 檔案，該檔案應該被正確處理、索引，並且只有本地文章會被顯示在部落格中
**Validates: Requirements 2.1, 3.3, 3.4, 4.5, 6.3**

### Property 4: 核心功能保持性
*For any* 核心部落格功能（搜尋、markdown 渲染、語法高亮），在新系統中應該與舊系統行為一致
**Validates: Requirements 2.2, 2.4, 2.5**

### Property 5: GitHub 匯入功能移除完整性
*For any* 前端頁面和程式碼庫掃描，不應該包含任何與 GitHub repository 匯入相關的 UI 元素、檔案或功能
**Validates: Requirements 3.1, 3.2**

### Property 6: HTTPS 存取保證
*For any* 部落格頁面訪問，應該透過 HTTPS 協議提供服務
**Validates: Requirements 1.2**

### Property 7: SEO 最佳化
*For any* 產生的 HTML 頁面，應該包含適當的 meta tags 和可索引的內容結構
**Validates: Requirements 7.1, 7.3, 7.4, 7.5**

## Error Handling

### 建置失敗處理
- GitHub Actions workflow 應該在任何步驟失敗時停止執行
- 提供清楚的錯誤訊息和日誌
- 失敗的部署不應該影響現有的 GitHub Pages 內容

### 文章解析錯誤
- 無效的 YAML frontmatter 應該被記錄但不中斷建置
- 損壞的 markdown 檔案應該被跳過並記錄警告
- 建置過程應該對個別文章錯誤具有容錯性

### 部署回滾
- 保持 GitHub Pages 的版本歷史
- 失敗的部署可以透過重新執行 workflow 或回滾 commit 來修復

## Testing Strategy

### 單元測試
- 測試文章解析功能
- 測試搜尋功能
- 測試建置腳本的核心邏輯
- 測試前端組件的基本功能

### 整合測試
- 測試完整的建置流程
- 測試 GitHub Actions workflow（在測試環境）
- 測試部署後的網站功能

### 屬性測試
- 使用 fast-check 進行屬性測試
- 每個測試執行最少 100 次迭代
- 測試標籤格式：**Feature: github-pages-migration, Property {number}: {property_text}**

**測試配置**:
- 使用現有的 Vitest 測試框架
- 保持現有的測試結構和命名慣例
- 新增針對 GitHub Pages 特定功能的測試
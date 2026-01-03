# Git Submodule 使用指南

## 概述

本專案現在使用 Git Submodule 來管理文章內容，從 `marvelshan/tech-forum` repository 載入文章。這種方式提供了更好的效能、版本控制和穩定性。

## 優勢

- **快速建置**：建置時間從 30-60 秒縮短到 1-5 秒
- **離線支援**：一旦 clone 後可離線建置
- **版本控制**：完整的內容版本歷史追蹤
- **穩定性**：不受網路和 API 限制影響

## 基本操作

### 初次 Clone 專案

```bash
# Clone 主專案並包含 submodule
git clone --recurse-submodules https://github.com/marvelshan/kiro-aws-ai-demo.git

# 或者先 clone 主專案，再初始化 submodule
git clone https://github.com/marvelshan/kiro-aws-ai-demo.git
cd kiro-aws-ai-demo
git submodule init
git submodule update
```

### 更新文章內容

#### 手動更新

```bash
# 更新 submodule 到最新版本
git submodule update --remote articles

# 提交更新
git add articles
git commit -m "更新文章內容到最新版本"
git push
```

#### 自動更新

專案已設定 GitHub Actions 自動更新機制：

- **每日自動更新**：每天 UTC 02:00 (台灣時間 10:00) 自動檢查並更新
- **手動觸發**：在 GitHub Actions 頁面可手動觸發更新
- **Webhook 觸發**：當 tech-forum 有新內容時自動觸發（需設定 webhook）

### 檢查 Submodule 狀態

```bash
# 檢查 submodule 狀態
git submodule status

# 檢查 submodule 的 commit 資訊
cd articles
git log --oneline -5
cd ..
```

### 鎖定特定版本

```bash
# 切換到特定 commit
cd articles
git checkout <commit-hash>
cd ..

# 提交版本鎖定
git add articles
git commit -m "鎖定文章內容到特定版本: <commit-hash>"
git push
```

## 建置流程

### 本地開發

```bash
# 安裝依賴
npm install

# 建置網站
npm run build

# 執行測試
npm test
```

### 部署流程

1. **內容更新**：Submodule 更新觸發
2. **自動建置**：GitHub Actions 自動建置
3. **部署**：自動部署到 GitHub Pages

## 故障排除

### Submodule 未正確載入

```bash
# 重新初始化 submodule
git submodule deinit articles
git submodule init
git submodule update
```

### 建置失敗

```bash
# 檢查 articles 目錄是否存在且有內容
ls -la articles/

# 檢查 submodule 狀態
git submodule status

# 強制更新 submodule
git submodule update --init --recursive --force
```

### 內容不是最新的

```bash
# 檢查 submodule 的遠端狀態
cd articles
git fetch origin
git status

# 更新到最新版本
git reset --hard origin/main
cd ..
git add articles
git commit -m "更新到最新內容"
```

## 開發工作流程

### 1. 內容作者工作流程

1. 在 `tech-forum` repository 中編寫/修改文章
2. 提交並推送到 `tech-forum`
3. 等待自動更新機制觸發，或手動觸發更新

### 2. 網站維護者工作流程

1. 監控 GitHub Actions 的執行狀況
2. 必要時手動觸發 submodule 更新
3. 處理建置或部署問題

### 3. 開發者工作流程

1. Clone 專案時使用 `--recurse-submodules`
2. 定期更新 submodule: `git submodule update --remote`
3. 測試新內容的顯示效果

## 設定檔案

### .gitmodules

```ini
[submodule "articles"]
	path = articles
	url = https://github.com/marvelshan/tech-forum.git
```

### GitHub Actions

- `.github/workflows/update-submodule.yml`：自動更新 submodule
- `.github/workflows/deploy.yml`：部署到 GitHub Pages

## 監控和維護

### 監控項目

1. **GitHub Actions 執行狀況**
2. **Submodule 更新頻率**
3. **建置時間和成功率**
4. **網站內容更新狀況**

### 定期維護

1. **每週檢查**：GitHub Actions 執行記錄
2. **每月檢查**：Submodule 設定和相依性
3. **季度檢查**：整體架構和效能最佳化

## 相關指令參考

```bash
# Submodule 相關指令
git submodule add <url> <path>          # 添加 submodule
git submodule init                      # 初始化 submodule
git submodule update                    # 更新 submodule
git submodule update --remote           # 更新到遠端最新版本
git submodule status                    # 檢查狀態
git submodule deinit <path>             # 移除 submodule

# 專案相關指令
npm run build                           # 建置網站
npm test                               # 執行測試
npm run deploy                         # 部署（如果有設定）
```

## 注意事項

1. **不要直接修改 articles/ 目錄中的檔案**，所有修改應該在 tech-forum repository 中進行
2. **定期更新 submodule** 以獲取最新內容
3. **注意 submodule 的 commit hash**，確保團隊使用相同版本
4. **備份重要設定**，包括 .gitmodules 和 GitHub Actions 設定
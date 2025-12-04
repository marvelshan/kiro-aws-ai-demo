# Kiro AI IDE Demo 腳本（給主管）

## Demo 時長：15-20 分鐘

---

## 開場（2 分鐘）

### 介紹問題
"在傳統開發中，我們經常面臨：
- 需求不明確導致返工
- 程式碼品質不一致
- 文件過時
- 重複性任務浪費時間"

### 解決方案
"Kiro AI IDE 透過結構化的 Spec-Driven Development 解決這些問題。"

---

## Part 1: Spec-Driven Development（5 分鐘）

### 展示三個核心文件

#### 1. Requirements.md
```
打開：.kiro/specs/ai-tool-integration/requirements.md
```

**重點說明：**
- "這是使用 EARS 語法的結構化需求"
- "每個需求都有清晰的 User Story 和 Acceptance Criteria"
- "消除了傳統需求文件的模糊性"

**指出具體範例：**
```markdown
WHEN 讀者訪問首頁 THEN THE BS SHALL 顯示所有可用文章的列表
```

#### 2. Design.md
```
打開：.kiro/specs/ai-tool-integration/design.md
```

**重點說明：**
- "設計文件包含架構、元件、資料模型"
- "最重要的是 Correctness Properties - 用於 Property-Based Testing"
- "這是 Living Documentation，隨程式碼演進更新"

**指出 Correctness Property：**
```markdown
Property 2: Article list sorted by date
*For any* article list, the articles should be ordered by publication date from newest to oldest.
**Validates: Requirements 1.3**
```

#### 3. Tasks.md
```
打開：.kiro/specs/ai-tool-integration/tasks.md
```

**重點說明：**
- "任務列表將設計分解為可執行的步驟"
- "每個任務都連結到特定需求"
- "自動追蹤進度"
- "可選任務標記為 * 以加快 MVP 開發"

---

## Part 2: 實際系統展示（5 分鐘）

### 啟動系統
```bash
# 如果還沒啟動
npm run build
npx http-server dist -p 8080 -c-1 --proxy http://localhost:8080?
```

訪問：http://localhost:8080

### 展示功能

#### 1. 基本功能（1 分鐘）
- 顯示文章列表
- 點擊文章查看詳情
- 展示 Markdown 渲染和語法高亮
- 返回列表

**說明：**
"這是一個完整的靜態部落格系統，包含文章管理和展示功能。"

#### 2. 搜尋功能（2 分鐘）
- 在搜尋欄輸入關鍵字（例如："kubernetes"）
- 展示即時搜尋結果
- 清除搜尋

**說明：**
"搜尋功能使用智能權重排序，標題匹配權重最高。"

#### 3. GitHub 導入功能（2 分鐘）
- 點擊「導入 GitHub Repo」按鈕
- 輸入：`https://github.com/marvelshan/tech-forum`
- 點擊「讀取文章」
- 展示預覽
- 點擊「確認導入」
- 瀏覽導入的文章

**說明：**
"這個功能可以從任何 GitHub repository 自動讀取 markdown 檔案，非常適合快速建立知識庫或文件網站。"

---

## Part 3: AWS 基礎設施（3 分鐘）

### 展示 CDK 程式碼
```
打開：infrastructure/lib/blog-infrastructure-stack.js
```

**重點說明：**
- "使用 AWS CDK 定義基礎設施即程式碼"
- "包含 S3 bucket 和 CloudFront distribution"
- "遵循 AWS 最佳實踐：加密、版本控制、存取日誌"

### 展示架構圖
```
在 README.md 中展示架構說明
```

**說明：**
"完整的 serverless 架構：
- S3 託管靜態檔案
- CloudFront 提供全球 CDN
- HTTPS 強制執行
- 自動快取管理"

---

## Part 4: Kiro 的獨特功能（3 分鐘）

### 1. MCP Server 整合

**展示配置：**
```
打開：.kiro/settings/mcp.json（如果有）
```

**說明：**
"MCP Servers 讓 Kiro 可以：
- 即時搜尋 AWS 文件
- 取得 CDK 最佳實踐
- 驗證 CDK Nag 規則
- 網路搜尋最新資訊"

### 2. Hooks 自動化

**展示 Hook：**
```
打開：.kiro/hooks/auto-commit-on-task-complete.kiro.hook
```

**說明：**
"Hooks 可以自動化：
- 任務完成時自動 commit
- 程式碼變更時執行測試
- 檔案修改時更新文件
- 完全可自訂的工作流程"

### 3. Agent Steering

**展示 Steering 檔案：**
```
打開：.kiro/steering/develop_standard.md（如果有）
```

**說明：**
"Agent Steering 確保：
- 一致的程式碼風格
- 遵循最佳實踐
- 自動執行編碼標準
- 減少 Code Review 負擔"

---

## Part 5: 開發流程展示（2 分鐘）

### 展示任務執行

**說明流程：**
1. "從 tasks.md 選擇一個任務"
2. "Kiro 讀取 requirements 和 design"
3. "根據 Correctness Properties 生成程式碼"
4. "執行測試驗證"
5. "到達 Checkpoint 確保品質"

**展示已完成的任務：**
```
在 tasks.md 中展示已勾選的任務
```

---

## 結尾：價值主張（2 分鐘）

### 量化優勢

**開發速度：**
- "結構化方法減少返工時間"
- "自動化節省重複性任務時間"
- "清晰的任務分解加快開發"

**程式碼品質：**
- "Property-Based Testing 捕捉 Edge Cases"
- "Checkpoints 確保品質關卡"
- "Agent Steering 自動執行標準"

**團隊協作：**
- "Living Documentation 始終最新"
- "新人 Onboarding 時間從週縮短到天"
- "清晰的需求追溯"

### 成本效益

**基礎設施成本：**
- "Serverless 架構按使用付費"
- "CloudFront 快取減少 S3 請求"
- "小型部落格每月成本 < $5"

**開發成本：**
- "減少 Debug 時間"
- "降低 Technical Debt"
- "提高團隊生產力"

---

## Q&A 準備

### 常見問題

#### Q1: "學習曲線如何？"
**A:** "Kiro 的結構化方法實際上降低了學習曲線。新團隊成員可以透過閱讀 requirements 和 design 快速了解專案。我們可以從小型專案開始試點。"

#### Q2: "如何與現有工具整合？"
**A:** "Kiro 是一個 IDE，可以與現有的 Git、CI/CD、AWS 工具無縫整合。MCP Servers 提供了擴展性。"

#### Q3: "安全性如何？"
**A:** "所有程式碼都在本地執行。Kiro 不會上傳程式碼到雲端。MCP Servers 可以配置為使用內部服務。"

#### Q4: "成本是多少？"
**A:** "Kiro 本身的授權成本需要評估，但透過提高效率和減少錯誤，可以快速回收投資。我可以準備詳細的 ROI 分析。"

#### Q5: "如何開始？"
**A:** "建議從一個小型專案開始試點，例如內部工具或文件網站。我可以帶領團隊進行為期 2 週的試點。"

---

## Demo 後續行動

### 立即行動
1. 分享提案文件
2. 提供 GitHub repository 連結
3. 安排技術團隊討論

### 短期計畫（1-2 週）
1. 選擇試點專案
2. 設定 Kiro 環境
3. 團隊培訓 session

### 中期計畫（1-2 個月）
1. 完成試點專案
2. 收集團隊回饋
3. 評估擴展到更多專案

---

## Demo 技巧

### 準備工作
- [ ] 確保本地伺服器運行正常
- [ ] 準備好所有檔案在編輯器中打開
- [ ] 測試 GitHub 導入功能
- [ ] 準備備用的 GitHub repository URL
- [ ] 確保網路連線穩定

### 展示技巧
- 保持簡潔，專注於價值
- 使用具體範例而非抽象概念
- 強調解決的實際問題
- 準備好回答技術和商業問題
- 展示信心但保持謙虛

### 避免事項
- 不要陷入技術細節
- 不要批評現有工具
- 不要過度承諾
- 不要忽略潛在挑戰

---

## 備用 Demo 場景

### 如果時間充裕（30 分鐘版本）

額外展示：
1. **Property-Based Testing**
   - 展示測試檔案
   - 解釋如何從 Correctness Properties 生成測試

2. **部署流程**
   - 展示 CDK deploy 命令
   - 說明 CI/CD 整合

3. **錯誤處理**
   - 展示錯誤日誌
   - 說明 CloudWatch 整合

### 如果時間緊迫（10 分鐘版本）

精簡版本：
1. 快速展示三個文件（2 分鐘）
2. 系統功能展示（4 分鐘）
3. 價值主張（2 分鐘）
4. Q&A（2 分鐘）

---

## 成功指標

Demo 成功的標誌：
- ✅ 主管理解 Spec-Driven Development 的價值
- ✅ 主管看到實際運作的系統
- ✅ 主管同意進行試點或進一步討論
- ✅ 獲得具體的下一步行動項目

---

祝你 Demo 成功！記住：專注於解決實際問題，而不是炫耀技術。

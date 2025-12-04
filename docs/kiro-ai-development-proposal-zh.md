# 使用 Kiro 進行 AI 驅動開發

## 執行摘要

身為一名 DevOps 工程師，我建議採用 **Kiro AI IDE** 作為我們使用 AI 輔助建構應用程式的主要開發工具。本提案展示了 Kiro 的規格驅動開發方法論，結合智能自動化功能，如何顯著改善我們的開發流程、程式碼品質和團隊協作。

---

## 目錄

1. [簡介](#簡介)
2. [Kiro 的優勢](#kiro-的優勢)
3. [規格驅動開發模型](#規格驅動開發模型)
4. [增強團隊協作](#增強團隊協作)
5. [MCP Server 整合](#mcp-server-整合)
6. [使用 Hooks 自動化](#使用-hooks-自動化)
7. [Agent Steering 確保一致性](#agent-steering-確保一致性)
8. [Checkpoint 機制](#checkpoint-機制)
9. [實際應用案例](#實際應用案例)
10. [結論](#結論)

---

## 簡介

傳統軟體開發經常面臨以下問題：
- 需求不明確導致範圍蔓延
- 團隊成員之間程式碼品質不一致
- 手動重複性任務消耗寶貴時間
- 文件不完整且知識轉移困難
- 難以維持編碼標準

**Kiro AI IDE** 透過結構化、AI 輔助的方法來解決這些挑戰，同時保持人工監督並自動化例行任務。

---

## Kiro 的優勢

### 為什麼 Kiro 脫穎而出

Kiro 不只是另一個 AI 編碼助手。它是一個綜合開發環境，結合了：

1. **結構化開發流程** - Spec-driven 方法論確保從需求到實作的清晰度
2. **智能自動化** - Hooks 和 Agents 自動處理重複性任務
3. **品質保證** - 內建 Checkpoints 和 Property-Based Testing
4. **團隊協作** - Living Documentation 隨專案演進持續更新
5. **可擴展性** - MCP Server 整合提供增強功能

### 關鍵差異化特點

| 功能 | 傳統 IDE + AI | Kiro AI IDE |
|---------|---------------------|-------------|
| 需求管理 | 手動文件 | 結構化 requirements.md 使用 EARS 模式 |
| 設計文件 | 經常過時 | Living design.md 包含 Correctness Properties |
| 任務規劃 | 臨時或獨立工具 | 整合的 tasks.md 追蹤進度 |
| 程式碼標準 | Linting + 人工審查 | Agent Steering 自動執行 |
| 自動化 | 自訂腳本 | 內建 Hooks 系統 |
| 測試策略 | 手動撰寫測試 | Property-Based Testing 整合 |

---

## Spec-Driven Development 模型

### 三文件工作流程

Kiro 使用結構化方法，透過三個核心文件來指導整個開發過程：

#### 1. **requirements.md** - 基礎

```markdown
## Requirements

### Requirement 1
**User Story:** 作為一個 [角色]，我想要 [功能]，以便 [好處]

#### Acceptance Criteria
1. WHEN [觸發條件], THE [系統] SHALL [回應]
2. WHILE [狀態], THE [系統] SHALL [回應]
```

**優點：**
- 使用 EARS（Easy Approach to Requirements Syntax）確保清晰度
- 遵循 INCOSE 品質標準
- 消除需求中的模糊性
- 提供清晰的驗收標準用於測試

#### 2. **design.md** - 藍圖

包含：
- **架構概覽** - 高層次系統設計
- **元件與介面** - 詳細的元件規格
- **資料模型** - 清晰的資料結構定義
- **正確性屬性** - 用於測試的形式化規格
- **錯誤處理** - 全面的錯誤情境
- **測試策略** - 單元測試和屬性基礎測試方法

**優點：**
- 作為 Living Documentation 持續更新
- 包含用於 Property-Based Testing 的 Correctness Properties
- 提供清晰的技術方向
- 促進 Code Review 和新人 Onboarding

#### 3. **tasks.md** - 執行計畫

```markdown
- [ ] 1. 建立專案結構
  - 建立目錄結構
  - 初始化相依套件
  - _Requirements: 1.1, 1.2_

- [ ] 2. 實作核心功能
  - [ ] 2.1 建立資料模型
  - [ ]* 2.2 撰寫屬性測試
  - [ ] 2.3 實作業務邏輯
```

**優點：**
- 將工作分解為可管理的任務
- 將任務連結到特定需求
- 自動追蹤進度
- 支援可選任務（標記為 `*`）

### 迭代流程

```
需求 → 設計 → 任務 → 實作 → Checkpoint → 下一個任務
 ↑                                              ↓
 └──────────────── 回饋循環 ────────────────────┘
```

每個階段在進入下一階段前都需要明確批准，確保一致性和品質。

---

## 增強團隊協作

### Living Documentation

與傳統文件會過時不同：

1. **需求可追溯**
   - 每個任務都參照特定需求
   - 需求變更會觸發設計更新
   - 清晰的決策 Audit Trail

2. **設計保持最新**
   - 與實作同步更新
   - 包含用於驗證的 Correctness Properties
   - 作為新人 Onboarding 材料

3. **進度可見**
   - 即時追蹤任務完成度
   - Checkpoints 確保品質關卡
   - 團隊成員可以看到已完成和待辦事項

### 知識轉移

當新團隊成員加入時：
- 閱讀 `requirements.md` 了解我們在建構什麼
- 審查 `design.md` 了解如何運作
- 檢查 `tasks.md` 查看當前進度
- 使用 Agent Steering 了解編碼標準

**結果：** Onboarding 時間從數週縮短到數天。

---

## MCP Server 整合

### 什麼是 MCP？

Model Context Protocol (MCP) 允許 Kiro 連接到外部工具和服務，將其功能擴展到 Code Generation 之外。

### 可用的 MCP Servers

#### 1. **AWS 文件伺服器**
```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"]
    }
  }
}
```

**使用案例：**
- 即時搜尋 AWS 文件
- 取得最新的 API 參考
- 尋找 AWS 服務的最佳實踐
- 發現新的 AWS 功能

#### 2. **AWS CDK 伺服器**
```json
{
  "mcpServers": {
    "cdk": {
      "command": "uvx",
      "args": ["awslabs.cdk-mcp-server@latest"]
    }
  }
}
```

**使用案例：**
- 使用最佳實踐生成 CDK constructs
- 根據 CDK Nag 規則驗證 CDK 程式碼
- 取得 AWS Solutions Constructs 模式
- 存取 GenAI CDK constructs

#### 3. **網路搜尋伺服器**
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "uvx",
      "args": ["mcp-server-brave-search"]
    }
  }
}
```

**使用案例：**
- 研究最新的函式庫版本
- 尋找技術問題的解決方案
- 掌握技術趨勢
- 驗證相容性資訊

### 實際範例

在實作錯誤處理時：
1. Kiro 搜尋 AWS 文件中的 CloudWatch 錯誤模式
2. 找到錯誤記錄的最佳實踐
3. 遵循 AWS 建議實作解決方案
4. 全程無需離開 IDE

---

## 使用 Hooks 自動化

### 什麼是 Hooks？

Hooks 是 Event-Driven 的自動化機制，根據開發工作流程中的特定事件觸發動作。

### Hook 類型

#### 1. **檔案編輯 Hooks**
當特定檔案被修改時觸發：

```json
{
  "when": {
    "type": "fileEdited",
    "patterns": [".kiro/specs/**/tasks.md"]
  },
  "then": {
    "type": "sendMessage",
    "message": "任務完成。建立有意義的 commit。"
  }
}
```

#### 2. **Agent 執行 Hooks**
當 agent 完成工作時觸發：

```json
{
  "when": {
    "type": "agentExecutionComplete"
  },
  "then": {
    "type": "executeCommand",
    "command": "npm test"
  }
}
```

#### 3. **Session Hooks**
在新 session 時觸發：

```json
{
  "when": {
    "type": "newSession"
  },
  "then": {
    "type": "sendMessage",
    "message": "審查開放任務並繼續工作。"
  }
}
```

### 實際使用案例

#### 任務完成時自動 Commit
```json
{
  "name": "任務完成時自動 Commit",
  "when": {
    "type": "fileEdited",
    "patterns": [".kiro/specs/**/tasks.md"]
  },
  "then": {
    "type": "sendMessage",
    "message": "使用 conventional 格式建立有意義的 git commit。"
  }
}
```

**優點：**
- 確保每個任務完成都被提交
- 維持乾淨的 git 歷史
- 自動化重複的 git 操作

#### 程式碼變更時自動測試
```json
{
  "name": "儲存時執行測試",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts", "tests/**/*.test.ts"]
  },
  "then": {
    "type": "executeCommand",
    "command": "npm test -- --run"
  }
}
```

**優點：**
- 程式碼變更的即時 Feedback
- 及早發現 Regression 問題
- 強制執行 Test-Driven Development

#### 更新文件
```json
{
  "name": "更新 API 文件",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/api/**/*.ts"]
  },
  "then": {
    "type": "sendMessage",
    "message": "API 已變更。更新 OpenAPI 規格。"
  }
}
```

**優點：**
- 保持文件同步
- 減少文件債務
- 改善 API 可發現性

---

## Agent Steering 確保一致性

### 什麼是 Agent Steering？

Agent Steering 為 AI Agent 提供 Context 和指示，確保整個專案的一致行為。

### Steering 檔案結構

位於 `.kiro/steering/*.md`：

```markdown
---
inclusion: always
---

# 開發標準

## 程式碼品質
- 所有新程式碼使用 TypeScript
- 遵循函數式程式設計原則
- 撰寫完整的 JSDoc 註解

## 測試要求
- 最低 80% 程式碼覆蓋率
- 核心邏輯使用屬性基礎測試
- API 端點使用整合測試

## AWS 最佳實踐
- 使用 CDK 管理基礎設施
- 啟用 CloudWatch 日誌記錄
- 實作適當的錯誤處理
```

### 包含類型

#### 1. **總是包含 (Always)**
```markdown
---
inclusion: always
---
```
應用於每次 Agent 互動。

#### 2. **條件包含 (Conditional)**
```markdown
---
inclusion: fileMatch
fileMatchPattern: "*.test.ts"
---
```
僅在匹配的檔案在 Context 中時應用。

#### 3. **手動包含 (Manual)**
```markdown
---
inclusion: manual
---
```
使用者透過聊天中的 `#steering-name` 明確包含。

### 實際範例

**Steering 檔案：`aws-standards.md`**
```markdown
---
inclusion: fileMatch
fileMatchPattern: "infrastructure/**/*.ts"
---

# AWS CDK 標準

## Construct 命名
- Construct 類別使用 PascalCase
- 以服務名稱為前綴（例如：`S3Bucket`、`LambdaFunction`）

## 安全性
- 預設啟用加密
- 使用最小權限 IAM 政策
- 啟用存取日誌記錄

## 標籤
所有資源必須包含：
- Environment（dev/staging/prod）
- 專案名稱
- 負責團隊
```

**結果：** 每個 CDK 檔案自動遵循這些標準，無需人工 Code Review。

---

## Checkpoint 機制

### 什麼是 Checkpoints？

Checkpoints 是任務列表中的品質關卡，確保在進入下一階段前所有測試都通過。

### Checkpoint 結構

```markdown
- [ ] 3. 實作使用者認證
  - [ ] 3.1 建立使用者模型
  - [ ] 3.2 實作 JWT tokens
  - [ ]* 3.3 撰寫 Property Tests

- [ ] 4. Checkpoint - 確保所有測試通過
  - 確保所有測試通過，如有問題請詢問使用者

- [ ] 5. 實作授權
  - [ ] 5.1 建立角色系統
  - [ ] 5.2 實作權限
```

### 優點

1. **品質保證 (Quality Assurance)**
   - 在邏輯斷點強制執行測試
   - 在問題複雜化前發現
   - 確保每個 Milestone 都有可運作的軟體

2. **風險緩解 (Risk Mitigation)**
   - 防止在破損的基礎上建構
   - 允許及早修正方向
   - 減少 Debug 時間

3. **團隊信心**
   - 清晰的進度指標
   - 驗證的工作狀態
   - Code Review 的安全點

### Checkpoint 最佳實踐

- 在主要功能後放置 checkpoints
- 大型專案中包含多個 checkpoints
- 在整合工作前使用 checkpoints
- 部署任務前總是使用 checkpoint

---

## 結論

### 關鍵要點

1. **結構化方法**
   - Spec-Driven Development 消除模糊性
   - 三文件工作流程確保清晰度
   - 具有 Approval Gates 的迭代流程

2. **增強功能**
   - MCP Servers 提供即時資訊
   - Hooks 自動化重複性任務
   - Agent Steering 確保一致性

3. **品質保證**
   - Checkpoints 強制執行品質關卡
   - Property-Based Testing 捕捉 Edge Cases
   - Living Documentation 保持最新

4. **團隊優勢**
   - 更快的 Onboarding
   - 更好的協作
   - 一致的程式碼品質
   - 減少 Technical Debt

## 附錄

### 資源

- [Kiro 文件](https://kiro.dev/docs)
- [MCP Server Registry](https://github.com/modelcontextprotocol)
- [EARS 需求指南](https://www.iaria.org/conferences2012/filesICCGI12/ICCGI_2012_Tutorial_Mavin.pdf)
- [屬性基礎測試](https://hypothesis.works/articles/what-is-property-based-testing/)

### 聯絡方式

如有問題或需要展示，請聯絡：
- **姓名：** Zaki
- **職位：** DevOps 工程師
- **Email：** reborn7875@gmail.com

---

*本提案展示了在建構生產應用程式時實際使用 Kiro AI IDE 的情況。所有範例和指標都基於實際實作。*

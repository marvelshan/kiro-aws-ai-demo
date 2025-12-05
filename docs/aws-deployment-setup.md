# AWS 部署設定指南

本文件說明如何設定 AWS 和 GitHub Actions 以啟用自動部署。

## 前置需求

- AWS 帳號
- GitHub repository 的管理員權限
- AWS CLI 已安裝並設定

## 步驟 1: 部署 AWS 基礎設施

首先，使用 AWS CDK 部署基礎設施：

```bash
# 安裝 CDK（如果還沒安裝）
npm install -g aws-cdk

# Bootstrap CDK（首次使用）
npx cdk bootstrap

# 部署基礎設施
npm run cdk:deploy
```

部署完成後，記下以下資訊：
- S3 Bucket 名稱
- CloudFront Distribution ID

## 步驟 2: 設定 AWS IAM Role for GitHub Actions

### 2.1 建立 OIDC Provider

在 AWS Console 或使用 CLI 建立 OIDC provider：

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2.2 建立 IAM Role

建立一個 IAM role，trust policy 如下：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
```

**重要**: 將 `YOUR_ACCOUNT_ID`、`YOUR_GITHUB_USERNAME` 和 `YOUR_REPO_NAME` 替換為實際值。

### 2.3 附加權限政策

為 IAM role 附加以下權限：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
    }
  ]
}
```

## 步驟 3: 設定 GitHub Secrets

在 GitHub repository 設定以下 secrets：

1. 前往 GitHub repository
2. 點擊 **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **New repository secret** 並新增以下 secrets：

| Secret 名稱 | 說明 | 範例 |
|------------|------|------|
| `AWS_ROLE_ARN` | IAM Role 的 ARN | `arn:aws:iam::123456789012:role/GitHubActionsRole` |
| `AWS_REGION` | AWS 區域 | `us-east-1` |
| `S3_BUCKET_NAME` | S3 bucket 名稱 | `my-blog-bucket` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID | `E1234567890ABC` |

## 步驟 4: 啟用 GitHub Actions 部署

編輯 `.github/workflows/deploy.yml`，取消註解 AWS 部署步驟：

```yaml
- name: Configure AWS credentials
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: ${{ secrets.AWS_REGION || 'us-east-1' }}

- name: Deploy to S3
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: |
    aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_NAME }}/ --delete

- name: Invalidate CloudFront cache
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: |
    aws cloudfront create-invalidation \
      --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
      --paths "/*"
```

## 步驟 5: 測試部署

推送變更到 main branch：

```bash
git add .
git commit -m "Enable AWS deployment"
git push origin main
```

前往 GitHub Actions 頁面查看部署狀態。

## 疑難排解

### 錯誤: Credentials could not be loaded

**原因**: GitHub Secrets 未設定或 IAM Role 設定錯誤

**解決方案**:
1. 確認所有 GitHub Secrets 都已正確設定
2. 確認 IAM Role 的 trust policy 中的 repository 名稱正確
3. 確認 IAM Role 有足夠的權限

### 錯誤: Access Denied

**原因**: IAM Role 權限不足

**解決方案**:
1. 檢查 IAM Role 的權限政策
2. 確認 S3 bucket 和 CloudFront distribution 的 ARN 正確
3. 確認 bucket policy 允許該 role 存取

### 錯誤: Distribution not found

**原因**: CloudFront Distribution ID 錯誤

**解決方案**:
1. 在 AWS Console 確認 CloudFront Distribution ID
2. 更新 GitHub Secret `CLOUDFRONT_DISTRIBUTION_ID`

## 手動部署

如果不想使用 GitHub Actions，可以手動部署：

```bash
# 建置
npm run build

# 部署到 S3
aws s3 sync dist/ s3://YOUR_BUCKET_NAME/ --delete

# 清除 CloudFront 快取
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 安全性建議

1. **最小權限原則**: IAM Role 只給予必要的權限
2. **限制 repository**: Trust policy 中明確指定 repository 名稱
3. **定期審查**: 定期檢查 IAM Role 的使用情況
4. **啟用 MFA**: 為 AWS 帳號啟用多因素認證
5. **監控**: 設定 CloudWatch 警報監控異常活動

## 成本估算

使用 AWS 免費方案，小型部落格的成本通常很低：

- **S3**: 前 5GB 免費
- **CloudFront**: 前 1TB 傳輸免費（12 個月）
- **預估月費**: $0 - $5（取決於流量）

## 參考資源

- [AWS CDK 文件](https://docs.aws.amazon.com/cdk/)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM 最佳實踐](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

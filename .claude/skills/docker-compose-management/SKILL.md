---
name: docker-compose-management
description: Docker Composeのポート競合管理とコンテナライフサイクル管理。
---

# Docker Compose 管理

## ポート競合管理（ADR-0004準拠）

### `docker compose up` 前のチェック
1. 使用予定ポート（3000, 4000, 5432）の使用状況を確認
2. 競合が検出された場合:
   - 同一 `docker-compose.yml` 管理下のコンテナ → 自動停止して再起動
   - 他プロジェクトのコンテナ → エラーメッセージで手動対応を促す

### ポートチェック手順
```bash
# ポート使用状況の確認
lsof -i :3000 -i :4000 -i :5432

# 同一プロジェクトのコンテナ停止
docker compose down

# コンテナ起動
docker compose up -d
```

## コンテナ操作

### 起動
```bash
docker compose up -d
```

### 停止
```bash
docker compose down
```

### ログ確認
```bash
docker compose logs -f [service-name]
```

### 再ビルド（依存変更時）
```bash
docker compose build --no-cache [service-name]
docker compose up -d
```

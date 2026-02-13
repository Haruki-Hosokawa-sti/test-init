# test-init

技術スタックの学習・検証を目的としたテストプロジェクト。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js 15 (App Router) |
| バックエンド | NestJS 11 |
| API | GraphQL (Apollo Server) |
| データベース | PostgreSQL 15 |
| ORM | Prisma 6 |
| テスト | Vitest |
| リンター/フォーマッター | Biome |
| コンテナ | Docker Compose |

## セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env の DATABASE_URL を環境に合わせて編集

# Docker コンテナの起動（PostgreSQL）
docker compose up -d db

# Prisma マイグレーション（初回）
npx prisma migrate dev --name init

# 開発サーバーの起動
npm run dev
```

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 全パッケージの開発サーバー起動 |
| `npm run build` | 全パッケージのビルド |
| `npm test` | 全パッケージのテスト実行 |
| `npm run type-check` | TypeScript型チェック |
| `npm run check` | Biome（lint + format）チェック |
| `npm run check:fix` | Biome自動修正 |
| `npm run format` | コードフォーマット |

## ディレクトリ構造

```
test-init/
├── packages/
│   ├── front/          # Next.js フロントエンド
│   │   ├── app/        # App Router
│   │   ├── src/        # ソースコード
│   │   └── vitest.config.ts
│   └── back/           # NestJS バックエンド
│       ├── src/        # ソースコード
│       ├── prisma/     # Prisma スキーマ
│       └── vitest.config.ts
├── docker-compose.yml  # Docker Compose 設定
├── biome.json          # Biome 設定（ルート共有）
├── tsconfig.json       # TypeScript設定（project references）
└── package.json        # ルート（workspaces）
```

## ライセンス

MIT

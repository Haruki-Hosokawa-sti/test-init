# プロジェクト初期化タスクリスト

boilerPlateクローン後、開発開始可能な状態にするための作業手順。
`/implement このファイル` で自律実行可能。

## 前提条件

- Node.js LTS版（実行時の最新LTS。`node --version` で確認し、package.json の engines を合わせて更新すること）
- Git初期化済み、`npm install` 実行済み
- Docker（docker-compose選択時）

## ロールバック戦略（ADR-0001準拠）

各フェーズ完了時にGit commitを作成する。エラー発生時は `git reset --hard HEAD~N` で直前の安定状態に復元する。

- commitメッセージ形式: `init: Phase X - 説明`
- 外部サービス（GitHub, JIRA等）の変更はロールバック対象外
- commit一覧は末尾の「commit一覧」セクション参照

---

## Phase 0: 設定ファイル確認と技術要素の選択

### 0.1 .claude-init.yaml の確認（PRD要件9.2）

- `.claude-init.yaml` の存在を確認
- **存在する場合**: YAML設定を読み込み、Phase 0.2をスキップして設定値を後続フェーズに使用
- **存在しない場合**: Phase 0.2に進む
- **無効な設定値の場合**: エラーメッセージを表示し、デフォルト値にフォールバック

### 0.2 技術要素の選択（ADR-0006準拠）

AskUserQuestion（multiSelect: true）で以下を選択:

- docker-compose（推奨）
- front - Next.js（推奨）
- back - NestJS（推奨）
- GraphQL（推奨）
- PostgreSQL（推奨）
- Prisma（推奨）
- vitest（推奨）
- biome（推奨）

### 0.3 依存関係バリデーション

選択結果に対して以下の依存関係を検証:

| 技術要素 | 依存先 | 未選択時の対応 |
|---------|--------|--------------|
| GraphQL | back | 警告表示し、backを自動追加 |
| Prisma | back + PostgreSQL | 警告表示し、不足要素を自動追加 |
| PostgreSQL | docker-compose（推奨） | 警告のみ（ローカルDB利用を想定） |

**完了条件**:
- 技術要素の選択が完了し、依存関係が整合している
- 選択結果が後続フェーズで参照可能

※以降のフェーズは選択結果に応じて条件分岐。

---

## Phase 1: 言語設定

`npm run lang:ja` を実行。

**完了条件**:
- `.claudelang` が存在し Japanese 設定
- `CLAUDE.md` が日本語版に切替済み
- `.claude/commands-ja/` が生成済み

**commit**: `init: Phase 1 - 言語設定`

---

## Phase 2: JIRA MCP自動検出

- MCPサーバーの存在を確認
- 存在する → 接続テスト実行
- 存在しない → 警告表示してスキップ（初期化は継続）

**完了条件**:
- MCPサーバーの存在確認が完了している
- 存在する場合: 接続テスト結果が記録されている
- 存在しない場合: 警告メッセージが表示されている

**commit**: `init: Phase 2 - JIRA MCP検出`

---

## Phase 3: モノレポ化と技術要素セットアップ

### 3.1 既存ファイルの整理

モノレポ化に先立ち、boilerplate標準の既存ファイルを処理:

- `src/` ディレクトリ → 削除（boilerplateのサンプルコード）
- `vitest.config.mjs` → 後続ステップで各パッケージ用に再作成するため削除

### 3.2 ディレクトリ構造作成（ADR-0003準拠）

選択に応じて作成:

- `packages/front/`（front選択時）
- `packages/back/`（back選択時）
- `packages/shared/`（front + back両方選択時）

### 3.3 ルート package.json に workspaces 追加

```json
"workspaces": ["packages/*"]
```

### 3.4 TypeScript設定

- ルート `tsconfig.json` に project references 追加
- 各パッケージに個別 `tsconfig.json` 作成
- パスエイリアスを各パッケージに合わせて設定

### 3.5 既存設定ファイルのパス調整

モノレポ化に伴い、以下のファイルのパスを更新:

**package.json scripts**:
- `build` → 各パッケージの個別ビルド + ルートから一括実行
- `test` → `npm run test --workspaces`
- `format` / `lint` / `check` → `packages` 配下を対象に変更

**biome.json**:
- `files.include` → `["packages/*/src/**/*.ts", "packages/*/src/**/*.tsx"]` に変更
- `overrides` → テストファイルパスも `packages/*/` 配下に更新

**vitest.config**:
- ルート設定を各パッケージ用に分割（front: jsdom, back: node）
- ルートに workspace 実行用設定を残す

**lint-staged**:
- パス `src/**/*.{ts,tsx}` → `packages/*/src/**/*.{ts,tsx}`

**commit**: `init: Phase 3-1 - モノレポ基盤構築`

---

### 3.6 docker-compose.yml 生成（docker-compose選択時）

選択された技術要素に応じたサービス定義:

- front: Next.js（port 3000）
- back: NestJS（port 4000）
- db: PostgreSQL 15（port 5432）

ポート競合管理（ADR-0004準拠）:
- `docker compose up` 前にポート競合チェック
- 同一 `docker-compose.yml` 管理下のコンテナのみ自動停止
- 他プロジェクトのコンテナ → エラーメッセージで手動対応を促す

### 3.7 Next.js 初期化（packages/front、front選択時）

- `package.json` 作成（依存: next, react, react-dom, typescript）
- `app/` ディレクトリ（App Router）
- `tsconfig.json`

### 3.8 NestJS 初期化（packages/back、back選択時）

- `package.json` 作成（依存: @nestjs/core, @nestjs/common 等）
- `src/` ディレクトリ
- `tsconfig.json`

### 3.9 GraphQL 統合（GraphQL + back選択時のみ）

- `@nestjs/graphql`, `@nestjs/apollo` を packages/back/package.json に追加
- `schema.gql` 作成
- `app.module` に GraphQLModule 登録

### 3.10 PostgreSQL + Prisma 設定（back選択時のみ）

- `packages/back/prisma/schema.prisma` 作成
- `@prisma/client` を packages/back/package.json に追加
- `.env.example` に `DATABASE_URL` のテンプレートを記載
- ※ `.env` 自体はユーザーが手動作成（Phase 6の制限ルール参照）

**commit**: `init: Phase 3-2 - 技術要素セットアップ`

---

### 3.11 vitest 設定（vitest選択時、各パッケージ個別）

- `packages/front/vitest.config.ts`（environment: jsdom）
- `packages/back/vitest.config.ts`（environment: node）
- 各 `package.json` に `"test": "vitest"` 追加
- ルート `package.json` に `"test": "npm run test --workspaces"` 追加

### 3.12 biome 設定（biome選択時、ルート統一）

- ルート `biome.json` を Phase 3.5 の内容で更新済みであることを確認
- ルート `package.json` の format/lint/check コマンドが packages 対応であることを確認

### 3.13 依存関係インストール

- ルートで `npm install` を実行（workspacesにより全パッケージの依存を一括インストール）
- Prisma選択時: `npx prisma generate` を実行

**commit**: `init: Phase 3-3 - 開発ツール設定`

**Phase 3 完了条件**:
- 選択した技術要素に対応するディレクトリとファイルが全て存在
- `npm install` が成功
- ルートの `package.json` に `workspaces` が設定されている
- 各パッケージの `tsconfig.json` が存在し、project references が設定されている
- 既存の `src/` と `vitest.config.mjs` が削除されている

---

## Phase 6: .env 編集制限ルール設定（ADR-0005準拠）

### 6.1 CLAUDE.md に追記

以下のルールをCLAUDE.mdに追記:

```
## 環境変数管理ルール

- `.env` ファイルへの Claude Code の Write/Edit 操作は禁止
- ユーザーによる手動編集は許可、Read 操作は許可
- `.gitignore` で commit 防止済み
```

### 6.2 technical-spec スキルに追記

`.claude/skills-ja/technical-spec/SKILL.md` に以下を追記:

```
## 環境変数管理とセキュリティ

- `.env` ファイルの使用は許可されるが、Claude CodeによるWrite/Edit操作は禁止
- 環境変数は一元管理し、型安全性を確保する仕組みを構築すること
- `process.env` の直接参照は避け、設定管理層を通じて取得すること
```

### 6.3 .claude/settings.json に設定

以下の設定を追加（既存設定がある場合はマージ）:

```json
{
  "writeDenyList": [
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.test"
  ]
}
```

**完了条件**:
- `CLAUDE.md` に `.env` 編集制限ルールが記載されている
- `technical-spec` スキルに環境変数管理ルールが記載されている
- `.claude/settings.json` に `writeDenyList` が設定されている

**commit**: `init: Phase 6 - .env編集制限`

---

## Phase 4: /implement コマンドの拡張（Should Have - オプション）

> **注意**: このフェーズはオプションです。Must Have（Phase 0-3, 6）の完了後に実行します。
> PRDのPhase 4（Git WorkTree）に相当する拡張機能です。
> スキップする場合は Phase 7 に進んでください。

### 4.1 git-worktree-workflow スキル新規作成

`.claude/skills-ja/git-worktree-workflow/SKILL.md` を作成:

- 新規要件受領時: `git worktree add` で Worktree + ブランチ作成
- 作業中: タスク完了ごとに commit（既存動作を維持）
- 作業完了時: `gh pr create` で PR 作成
- ブランチ命名規則: `feature/<タスク概要>`

### 4.2 docker-compose-management スキル新規作成

`.claude/skills-ja/docker-compose-management/SKILL.md` を作成:

- `docker compose up` 前にポート競合チェック（ADR-0004準拠）
- 競合時: 同一 `docker-compose.yml` 管理下のコンテナのみ自動停止
- 他プロジェクトのコンテナ → エラーメッセージで手動対応を促す

### 4.3 /implement コマンド修正

`.claude/commands-ja/implement.md` に以下を追記:

- 新規要件の場合: git-worktree-workflow スキルに従い Worktree 作成 → 作業 → PR 作成
- docker-compose 使用時: docker-compose-management スキルに従いポート競合管理
- 既存動作（タスク完了時 commit）は維持

### 4.4 既存スキルへの参照追加

以下のスキルに参照を追記:

- **subagents-orchestration-guide**: git-worktree-workflow、docker-compose-management スキルへの参照
- **technical-spec**: Docker Compose ポート競合管理ルール、WorkTree 運用ルールへの参照
- **project-context**: Git WorkTree 運用、Docker Compose 構成への参照

**完了条件**:
- 2つの新規スキルファイルが作成済み
- `/implement` コマンドに Worktree + PR 作成フローが追記済み
- 既存スキル3つに参照が追加済み

**commit**: `init: Phase 4 - /implementコマンド拡張`

---

## Phase 7: プロジェクト初期化

### 7.1 /project-inject 実行

プロジェクトコンテキストを `project-context.md` に注入。

### 7.2 /sync-skills 実行

スキルメタデータを同期し、rule-advisor の精度を最適化。

**完了条件**:
- `/project-inject` が正常完了し、`project-context.md` が更新されている
- `/sync-skills` が正常完了し、スキルメタデータが同期されている

**commit**: `init: Phase 7 - プロジェクト初期化`

---

## Phase 8: ドキュメント更新

### 8.1 README.md の更新

以下の内容でプロジェクト固有の説明に書き換え:

- プロジェクト名と概要
- 技術スタック（Phase 0の選択結果を反映）
- セットアップ手順（`npm install`、Docker起動方法）
- 開発コマンド一覧（build、test、lint等）
- ディレクトリ構造

### 8.2 docs/guides/ の初期化ガイド更新

- クイックスタートガイドを現在のプロジェクト構成に合わせて更新
- 選択した技術要素に対応するガイドに調整

### 8.3 リモートリポジトリへの push 方法提示

以下の手順をユーザーに提示（実行はしない）:

1. GitHub で新規リポジトリを作成
2. リモート設定:
   ```bash
   git remote set-url origin <新リポジトリURL>
   ```
3. プッシュ:
   ```bash
   git push -u origin main
   ```
4. 確認:
   ```bash
   gh repo view --web
   ```

※boilerPlate の origin を上書きする形になる旨を説明

**完了条件**:
- `README.md` がプロジェクト固有の内容に更新されている
- `docs/guides/` のガイドが現在のプロジェクト構成を反映している
- リモートリポジトリへのpush手順がユーザーに提示されている

**commit**: `init: Phase 8 - ドキュメント更新`

---

## commit一覧（ADR-0001準拠）

| # | commitメッセージ | Phase | 区分 |
|---|-----------------|-------|------|
| 1 | `init: Phase 1 - 言語設定` | Phase 1 | Must Have |
| 2 | `init: Phase 2 - JIRA MCP検出` | Phase 2 | Must Have |
| 3 | `init: Phase 3-1 - モノレポ基盤構築` | Phase 3.1-3.5 | Must Have |
| 4 | `init: Phase 3-2 - 技術要素セットアップ` | Phase 3.6-3.10 | Must Have |
| 5 | `init: Phase 3-3 - 開発ツール設定` | Phase 3.11-3.13 | Must Have |
| 6 | `init: Phase 6 - .env編集制限` | Phase 6 | Must Have |
| 7 | `init: Phase 4 - /implementコマンド拡張` | Phase 4 | Should Have |
| 8 | `init: Phase 7 - プロジェクト初期化` | Phase 7 | Must Have |
| 9 | `init: Phase 8 - ドキュメント更新` | Phase 8 | Must Have |

**エラー時のロールバック**:
```bash
# 直前のcommitでエラーが発生した場合
git reset --hard HEAD~1

# 複数フェーズ分戻す場合
git reset --hard HEAD~N  # Nは戻すcommit数
```

※ Phase 4（Should Have）でエラーが発生した場合、Phase 4のcommitのみをロールバックし、Must Haveの成果は維持する。

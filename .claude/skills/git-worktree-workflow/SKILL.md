---
name: git-worktree-workflow
description: Git WorkTreeを使用したブランチ管理とPR作成フロー。新規要件受領時のワークフローを定義。
---

# Git WorkTree ワークフロー

## 概要
新規要件受領時にGit WorkTreeを使用してブランチを管理し、PRを作成するワークフロー。

## ワークフロー

### 1. 新規要件受領時
- `git worktree add ../worktree-<タスク概要> feature/<タスク概要>` でWorktree + ブランチを作成
- ブランチ命名規則: `feature/<タスク概要>`（例: `feature/user-authentication`）

### 2. 作業中
- タスク完了ごとにcommit（既存の動作を維持）
- commitメッセージは変更内容を的確に反映

### 3. 作業完了時
- `gh pr create` でPRを作成
- PRタイトルは70文字以内
- PRボディにはサマリとテストプランを記載

## 注意事項
- mainブランチへの直接pushは禁止
- force pushは原則禁止（ユーザーの明示的指示がある場合のみ許可）
- WorkTree作業中は元のディレクトリでの作業に注意

# Email Summarizer

Gmail の受信メールを自動抽出し、Claude API で内容を要約・重要度判定する Web アプリ。

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **DB**: SQLite + Prisma ORM
- **Auth**: Google OAuth 2.0
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)

## Setup

### 1. Prerequisites

- Node.js 18+
- Google Cloud Console で OAuth 2.0 クライアント ID を作成
  - Authorized redirect URI: `http://localhost:3001/api/auth/callback`
  - Gmail API を有効化
- Anthropic API キーを取得

### 2. Backend

```bash
cd backend
cp .env .env.local  # Edit with your actual keys
npm install
npx prisma migrate dev
npm run dev
```

`.env` に以下を設定:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
JWT_SECRET=any_random_string
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Access

http://localhost:5173 にアクセスし、Google アカウントでログイン。

## Usage

1. **Rules** ページでフィルタールールを作成（件名/送信者/キーワードで条件設定）
2. **Dashboard** で「Sync Gmail」ボタンをクリック
3. 条件に合致するメールが AI 要約付きで一覧表示される
4. メールをクリックすると詳細パネルが表示される

## Production Deploy (Vercel + Railway)

### Step 1: Turso DB (無料)

```bash
# Turso CLI インストール
curl -sSfL https://get.tur.so/install.sh | bash

# DB 作成
turso db create email-summarizer
turso db show email-summarizer --url     # => TURSO_DATABASE_URL
turso db tokens create email-summarizer  # => TURSO_AUTH_TOKEN
```

### Step 2: Railway (バックエンド)

1. [railway.app](https://railway.app) にサインアップ
2. 「New Project」 > 「Deploy from GitHub repo」でリポジトリを選択
3. Root Directory を `backend` に設定
4. Environment Variables に以下を設定:
   - `TURSO_DATABASE_URL` - Turso の URL
   - `TURSO_AUTH_TOKEN` - Turso のトークン
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` = `https://<your-railway-domain>/api/auth/callback`
   - `ANTHROPIC_API_KEY`
   - `JWT_SECRET` - ランダムな文字列
   - `FRONTEND_URL` = `https://<your-vercel-domain>`
5. Deploy すると `https://xxx.railway.app` が発行される

### Step 3: Turso にテーブル作成

```bash
# マイグレーション SQL を Turso に適用
turso db shell email-summarizer < backend/prisma/migrations/20260305054516_init/migration.sql
```

### Step 4: Vercel (フロントエンド)

1. [vercel.com](https://vercel.com) にサインアップ
2. 「Import Project」でリポジトリを選択
3. Root Directory を `frontend` に設定
4. Environment Variables:
   - `VITE_API_BASE_URL` = `https://<your-railway-domain>`
5. Deploy

### Step 5: Google OAuth リダイレクト URI を更新

Google Cloud Console で Authorized redirect URI に本番 URL を追加:
`https://<your-railway-domain>/api/auth/callback`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/auth/google | Google OAuth redirect |
| GET | /api/auth/callback | OAuth callback |
| GET | /api/auth/me | Current user info |
| POST | /api/auth/logout | Logout |
| GET | /api/emails | Email list (paginated) |
| GET | /api/emails/:id | Email detail |
| POST | /api/emails/:id/summarize | Generate AI summary |
| PATCH | /api/emails/:id/read | Toggle read status |
| POST | /api/sync | Sync Gmail |
| GET | /api/rules | List filter rules |
| POST | /api/rules | Create rule |
| PUT | /api/rules/:id | Update rule |
| DELETE | /api/rules/:id | Delete rule |

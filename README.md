# Pierre Clone v2 - Frontend

Personal finance management application built with Next.js 14, React 18, and TypeScript.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Create .env.local from template
cp .env.local.example .env.local

# Make sure backend is running on http://localhost:5000
# Then start frontend dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm run start
```

## Environment Variables

**Development** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Production** (`.env.production`):
```
NEXT_PUBLIC_API_URL=https://api.example.com/api
```

The `NEXT_PUBLIC_` prefix makes this variable available to the browser.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.3** - Utility-first styling
- **Context API** - State management (auth, user data)

## Project Structure

```
app/
├── layout.tsx          # Root layout with AuthProvider
├── page.tsx            # Home/redirect page
├── (auth)/             # Authentication group
│   ├── login/          # Login page
│   └── register/       # Register page
└── dashboard/          # Protected dashboard

lib/
├── AuthContext.tsx     # Authentication state & hooks
├── api.ts              # HTTP client for backend
└── mockData.ts         # Mock data (legacy)
```

## Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. `useAuth()` hook manages auth state
5. Protected routes check authentication

## Deploy on Vercel

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

```bash
# Or deploy via Vercel CLI
npm i -g vercel
vercel
```

## Related Projects

- **Backend**: `pierre-clone-v2-backend` (Node.js + Express + SQLite)
- **Docs**: Full stack deployment guide in backend README

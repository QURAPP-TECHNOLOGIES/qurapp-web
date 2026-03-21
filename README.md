# QurApp Web & Admin

The public-facing web platform and administrative dashboard for QurApp.

## Tech Stack
- React / Next.js 
- TypeScript
- Tailwind CSS
- Supabase (Backend-as-a-Service integration)

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Environment Variables
Create a `.env` file based on `.env.example` with the following:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Deployment
Automated deployments are configured for Beta and Production environments via GitHub Actions.

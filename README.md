Fractured Survival Brain – Core Simulation & Oracle Abstraction

This project was bootstrapped with `create-next-app` (App Router + Tailwind) and extended with a Postgres + Prisma data layer and multi-model oracle service (GPT-5 placeholder and Claude Sonnet 4.5 placeholder).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Key UI panels on `app/page.tsx`:

- World status (from `text_blobs` row `world_status`)
- NPC list (click to select an NPC)
- Trust panel (shows trust states where selected NPC is source)
- Memory list (shows memories for selected NPC)
- Interaction console (trigger interactions, add memories, update trust, submit messages, choose model)

API endpoints under `app/api/*` implement core interactions.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Oracle / Model Integration

Environment variables in `.env`:

```
ORACLE_MODEL=gpt-5
CLAUDE_MODEL=claude-sonnet-4.5
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY_HERE
```

`src/lib/services/oracle.ts` exposes `summarize(content, model?)` and `listModels()` for provider abstraction. Currently these are stubs; integrate real calls by replacing the conditional blocks with fetch requests to provider APIs.

Test enabled models with:

```
curl http://localhost:3000/api/oracle/info
```

Use a specific model in interaction logic by passing `model` to `simulateInteraction` in `brainAgent.ts`.
The `InteractionConsole` component includes a model dropdown; selecting a model sends `model` in the POST body to `/api/npc/interact` and `/api/memory/add`.

## Factions & World Events

The system now supports:
- **Factions**: Groups of NPCs with shared lore. Manage via `/api/factions/*` or the Interaction Console.
- **World Events**: Global events (e.g., Weather, Invasion) that can affect simulation state. Manage via `/api/world/events/*`.

## Migrations & Seeding

The Postgres database is provisioned with Prisma migrations. Raw SQL seed (`prisma/seed.sql`) inserts initial NPCs and faction lore. Adjust or extend with additional rows as needed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

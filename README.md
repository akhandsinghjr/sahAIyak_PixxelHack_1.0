# सह-AI-यक (Sahayak): Mental Health Assistant

## Getting Started


```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create .env with your Groq key (server-side only; no VITE_ prefix)
cp .env.example .env
# then edit .env and set GROQ_API_KEY=... (from https://console.groq.com/keys)

# Step 5: Start the development server with auto-reloading and proxy to Groq.
npm run dev
```

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Groq setup (no server folder needed)

- The client never uses the Groq SDK directly. Instead, Vite’s dev proxy forwards POSTs from `/groq/*` to `https://api.groq.com/openai/*` and injects `Authorization: Bearer <GROQ_API_KEY>` from your `.env`.
- Ensure `.env` has `GROQ_API_KEY=...` before running `npm run dev`.
- The app calls `/groq/v1/chat/completions` from the browser; the proxy attaches auth and forwards it to Groq.

If you deploy, configure an equivalent server-side proxy or edge function to keep the API key secret. The included `server/` folder is not required for local dev of Groq features.

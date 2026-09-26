# Business Analyst Portfolio

A portfolio site plus a private admin panel, built with **Vite + React + Tailwind CSS v4 + Firebase** (Firestore and Google Auth).

- `/`: public portfolio with a hero, filterable projects and case-study modal, experience, tools and skills, and a contact form
- `/admin`: Google sign-in, then a dashboard where you edit your profile, projects, experience and tools with a live preview, and read or delete contact messages. Edits stay as a draft until you press **Publish changes**.

## Run locally

```bash
npm install
npm run dev
```

If Firebase isn't configured, the app runs in **demo mode**. Sign-in is simulated and content and messages are saved in your browser's localStorage.

## Connect Firebase

1. Create a project at https://console.firebase.google.com and add a **Web app**.
2. Enable **Authentication → Sign-in method → Google**.
3. Create a **Firestore database** (production mode).
4. Copy `.env.example` to `.env.local` and fill in the web-app config values. Set `VITE_ADMIN_EMAILS` to your Google account.
5. In `firestore.rules`, replace `you@example.com` with the same email.
6. Deploy the rules and the site:

```bash
npm i -g firebase-tools
firebase login
firebase use --add        # pick your project
npm run deploy            # vite build && firebase deploy
```

`firebase.json` sends every route to `index.html`, so `/admin` also works on Hosting. If you host somewhere else, add your domain under Authentication → Settings → Authorized domains.

## Data model

| Path | Who can read | Who can write |
| --- | --- | --- |
| `portfolio/content` | everyone | admin only |
| `messages/{id}` | admin only | anyone can create (validated); admin can delete |

Until you publish from the admin for the first time, the site shows the default content in `src/lib/portfolio-data.js`.

## Structure

```
src/
  main.jsx                 routes: /admin → Admin (lazy), else Portfolio
  index.css                Tailwind theme tokens and glass utilities
  lib/firebase.js          Firestore/Auth wrapper with demo fallback (SDK lazy-loaded)
  lib/portfolio-data.js    default content and helpers
  pages/Portfolio.jsx      public site
  pages/admin/Admin.jsx    admin shell, hash sub-routes (#/projects/2 …)
  pages/admin/fields.jsx   form field renderer
  pages/admin/previews.jsx live preview cards
```

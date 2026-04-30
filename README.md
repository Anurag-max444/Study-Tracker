# 📚 StudyVault — Setup & Deploy Guide

## Tera personal government job preparation tracker
**Tech Stack:** React + Vite + Supabase + Render

---

## STEP 1 — Supabase Setup (Database + Auth)

1. **https://supabase.com** pe jaa → "Start your project" → free account bana
2. New project create karo (name: `studyvault`, password yaad rakh)
3. Project ready hone ke baad **SQL Editor** open karo (left sidebar)
4. `supabase_schema.sql` file ka poora content copy karo aur SQL Editor mein paste karke **Run** karo
5. **Settings → API** pe jaa aur note karo:
   - `Project URL` → ye hai `VITE_SUPABASE_URL`
   - `anon public key` → ye hai `VITE_SUPABASE_ANON_KEY`

---

## STEP 2 — GitHub pe push karo

```bash
# Project folder mein jao
cd studyvault

# Git initialize karo
git init
git add .
git commit -m "StudyVault initial commit"

# GitHub pe naya repo banao (studyvault naam se)
# Phir:
git remote add origin https://github.com/TERA_USERNAME/studyvault.git
git branch -M main
git push -u origin main
```

---

## STEP 3 — Render pe Deploy

1. **https://render.com** → free account bana
2. **New → Static Site** select karo
3. GitHub repo connect karo (`studyvault`)
4. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. **Environment Variables** add karo:
   - `VITE_SUPABASE_URL` = tera Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = tera anon key
6. **Create Static Site** click karo
7. 2-3 minute mein deploy ho jaayega!
8. Tera URL milega: `https://studyvault-xxxx.onrender.com`

---

## STEP 4 — Local development (optional)

```bash
# .env file banao
cp .env.example .env
# .env mein apni Supabase keys daalo

# Dependencies install karo
npm install

# Dev server shuru karo
npm run dev
# http://localhost:5173 pe khulega
```

---

## Features

| Feature | Description |
|---|---|
| 🔐 Auth | Email/password login — fully private |
| 🏠 Dashboard | Stats, streak, weekly progress |
| ✅ Tasks | Daily tasks with subject + priority |
| ⏱️ Timer | Pomodoro — auto study log |
| 📚 Subjects | Chapter-wise checklist (15 chapters each) |
| 📝 Notes | Quick notes with subject filter |
| 🎯 Goals | Short/medium/long term roadmap |
| 📈 Analytics | Charts — hours, tasks, test scores |
| 🧪 Mock Tests | Score tracker with trend graph |

---

## Koi problem aaye?

- Supabase SQL error → schema dobara run karo
- Render deploy fail → build logs dekho, env vars check karo
- Login na ho → Supabase Authentication tab mein email confirm check karo

---

*Bana diya bhai — ab padhai shuru karo! 🔥*

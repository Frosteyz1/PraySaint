# ✝ PatronForge — Grow Closer to God

A Catholic-inspired AI companion built with Next.js 14+ (App Router), Tailwind CSS v4, and the Claude API. Features saint matching, an interactive Rosary, and faith-based meme generation.

---

## Features

| Route | Feature | Description |
|-------|---------|-------------|
| `/saints` | Saint Ally Builder | Match real patron saints to your life challenge; get a custom novena prayer + Canvas saint card |
| `/rosary` | Virtual Rosary | Interactive bead-by-bead Rosary with AI-generated intentions + mystery meditations |
| `/memes` | Catholic Meme Generator | Generate wholesome, uplifting Catholic memes drawn from Scripture and saint quotes |

All content is grounded in Catholic teaching (CCC referenced throughout) and generated with a single Claude API call per action.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_CLAUDE_API_KEY=sk-ant-api03-...
```

> **Security note:** `NEXT_PUBLIC_` variables are embedded in the client bundle. For production, rename this to `CLAUDE_API_KEY` (no prefix) in `.env.local` and update `app/api/generate/route.js` to use `process.env.CLAUDE_API_KEY`. The API route itself runs server-side, so the key is not exposed to the browser through the route — only through the `NEXT_PUBLIC_` prefix.

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## File Structure

```
patronforge/
├── app/
│   ├── layout.js               # Root layout with Nav + footer
│   ├── globals.css             # Tailwind v4 theme (Catholic gold/navy palette)
│   ├── page.js                 # Home page with feature cards
│   ├── saints/
│   │   └── page.js             # Saint Ally Builder
│   ├── rosary/
│   │   └── page.js             # Virtual Rosary
│   ├── memes/
│   │   └── page.js             # Catholic Meme Generator
│   └── api/
│       └── generate/
│           └── route.js        # Single Claude API endpoint (saints | rosary | memes)
├── components/
│   ├── Nav.js                  # Sticky nav with mobile hamburger
│   ├── PrayerCard.js           # HTML5 Canvas saint card (forwardRef)
│   ├── ShareButton.js          # PNG download + X share + copy link
│   └── ReflectionPrompt.js    # Modal faith reflection (ARIA accessible)
├── .env.local                  # API key (not committed)
└── README.md
```

---

## API Route

**`POST /api/generate`**

Single endpoint handling all three features. Pass `type` in the body:

### Saints
```json
{
  "type": "saints",
  "challenge": "I'm struggling with anxiety about a career change",
  "personality": "introverted artist",
  "teamMode": true
}
```

### Rosary
```json
{
  "type": "rosary",
  "mood": "seeking peace after a loss",
  "mysteryPreference": "Sorrowful"
}
```

### Memes
```json
{
  "type": "memes",
  "theme": "Monday mornings as a Catholic",
  "quote": "Be not afraid"
}
```

---

## Test Cases

### Saint Ally Builder

| Input | Expected Saints |
|-------|----------------|
| Challenge: "Battling addiction", Personality: "former athlete", Team: on | St. Matthew (tax collector → conversion), St. Maximilian Kolbe (sacrifice), St. Monica (perseverance in prayer) |
| Challenge: "Anxiety about exams", Team: off | St. Thomas Aquinas (patron of students) |
| Challenge: "Grief after losing a spouse", Team: on | St. Joseph, St. Monica, St. Thomas More |
| Challenge: "Starting a creative business", Team: off | St. Joseph the Worker or St. Luke (patron of artists) |

### Virtual Rosary

| Input | Expected |
|-------|---------|
| Mood: "joyful, celebrating a pregnancy" | Joyful Mysteries, intention about new life |
| Mood: "suffering, dealing with illness" | Sorrowful Mysteries |
| Mood: "" (blank), MysteryPref: "Luminous" | Luminous Mysteries with 5 meditations |

### Meme Generator

| Theme | Expected Style |
|-------|----------------|
| "Confession line is too long" | Humorous top text, relatable bottom text, navy bg |
| "Advent waiting" | Gold bg, "Good things come to those who wait" energy |
| "First communion jitters" | Cream bg, encouraging Saint quote |

---

## localStorage Keys

| Key | Contents |
|-----|---------|
| `patronforge_allies` | Array of up to 10 saved saint profiles |
| `patronforge_saint_streak` | `{ count, lastDate }` for Saint Ally daily streak |
| `patronforge_rosary_streak` | `{ count, lastDate }` for Rosary daily streak |
| `patronforge_meme_likes` | `{ memeId: likeCount }` object |

---

## Scalability Notes

- **Database:** Replace localStorage with Supabase for user galleries, shared intentions, and moderation queues
- **Auth:** Add Clerk or NextAuth for user accounts and premium features
- **Web search:** The API route has a comment stub for adding Anthropic's `web_search_20250305` tool for real-time saint fact verification
- **Audio:** Premium audio prayer guide can use browser Web Speech API or a TTS service
- **Moderation:** Meme gallery with DB would need a moderation flag system

---

## Catholic Alignment

All AI outputs are governed by system prompts that:
- Reference only canonized Catholic saints (never invented)
- Ground prayers in Catholic tradition (CCC 956, 2708, 1832)
- Include a footer disclaimer on every page
- Encourage users to seek formal spiritual direction from a priest

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **AI:** Claude Sonnet (`claude-sonnet-4-6`) via `@anthropic-ai/sdk`
- **Canvas:** HTML5 Canvas API (saint cards, rosary beads, meme overlay)
- **Share:** html2canvas + Web Share API fallback
- **Storage:** localStorage (MVP) → Supabase (scale)

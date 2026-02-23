import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// NOTE: Use CLAUDE_API_KEY (no NEXT_PUBLIC prefix) in production to avoid
// exposing the key in the client bundle. NEXT_PUBLIC_ vars are embedded client-side.
const client = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
});

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

// ─── System prompts ────────────────────────────────────────────────
const SAINTS_SYSTEM = `You are a reverent Catholic theologian and hagiographer. Your task is to match real, historically verified patron saints to a user's life situation and produce a Catholic spiritual profile.

Rules:
- Only reference saints officially recognized by the Catholic Church.
- Never invent fictional saints or fuse saints into composite fictional figures.
- Present saints as real individuals who intercede and model virtue (CCC 956).
- Prayers must be theologically sound, reverent, and in the Catholic tradition.
- Include accurate historical facts — feast days, patronages, symbols.
- Output ONLY valid JSON (no markdown, no code fences).

JSON format:
{
  "teamName": "string (e.g., 'Your Saint Ally' or 'Your Heavenly Team')",
  "saints": [
    {
      "name": "string (full canonical name)",
      "feastDay": "string (Month Day)",
      "backstory": "string (2-3 sentences, historically accurate)",
      "symbols": ["string", "..."],
      "powers": ["string (virtue/patronage)", "..."],
      "intercession": "string (how they intercede for this person)"
    }
  ],
  "teamPrayer": "string (a short novena-style prayer, 3-5 sentences, addressed to saints as intercessors to God)",
  "reflection": "string (a faith question tying to CCC 956)"
}`;

const ROSARY_SYSTEM = `You are a devout Catholic spiritual director guiding someone through the Holy Rosary. Your role is to provide meditations on the mysteries and suggest prayer intentions.

Rules:
- Follow traditional Catholic Rosary structure (CCC 2708, 2678).
- Reference Vatican-approved Marian prayers and approved papal meditations.
- Keep meditations scripture-grounded and doctrinally sound.
- Output ONLY valid JSON (no markdown, no code fences).

JSON format:
{
  "mysterySet": "string (Joyful | Sorrowful | Glorious | Luminous)",
  "intention": "string (a suggested prayer intention for today)",
  "mysteries": [
    {
      "number": 1,
      "name": "string",
      "scriptureRef": "string",
      "meditation": "string (2-3 sentences for contemplation)",
      "fruit": "string (virtue this mystery cultivates)"
    }
  ],
  "closingPrayer": "string (brief closing prayer, e.g., Hail Holy Queen paraphrase)",
  "reflection": "string (a faith question about Mary's intercession)"
}`;

const MEMES_SYSTEM = `You are a joyful Catholic creative writer producing uplifting faith-based meme content (CCC 1832 — joy is a fruit of the Holy Spirit).

Rules:
- Content must be wholesome, reverent, and uplifting — never mocking clergy, sacraments, or Church teaching.
- Draw on real Scripture passages, verified saint quotes, or Church teachings.
- Use gentle, joyful humor that invites people toward faith, not away from it.
- Output ONLY valid JSON (no markdown, no code fences).

JSON format:
{
  "topText": "string (short, punchy top line)",
  "bottomText": "string (punchline or quote, max 12 words)",
  "quote": "string (the source quote or Scripture verse used)",
  "source": "string (Saint name, Scripture ref, or CCC ref)",
  "bgColor": "string (one of: navy, gold, cream, purple, green)",
  "reflection": "string (a brief faith question tying to joy)"
}`;

// ─── User prompt builders ──────────────────────────────────────────
function buildSaintsPrompt({ challenge, personality, teamMode }) {
  const count = teamMode ? "2 or 3 real saints" : "1 real saint";
  return `A Catholic is facing this life situation: "${challenge}".
Their personality/background: "${personality}".
Please match ${count} whose patronage, virtues, or life story speaks directly to this challenge.
${teamMode ? "Show how they form a spiritual team of intercessors (CCC 956), listing each saint individually." : ""}
Return the JSON profile exactly as specified.`;
}

function buildRosaryPrompt({ mood, mysteryPreference }) {
  return `A person wants to pray the Rosary today.
Their current mood or intention: "${mood || "seeking peace and God's will"}".
${mysteryPreference ? `Preferred mystery set: ${mysteryPreference}.` : "Choose the most fitting mystery set for their mood."}
Provide all 5 mysteries for that set with meditations and a suggested intention.
Return the JSON exactly as specified.`;
}

function buildMemesPrompt({ theme, quote }) {
  return `Create an uplifting Catholic meme for this theme or quote:
Theme: "${theme}"
${quote ? `User's quote or verse: "${quote}"` : ""}
The meme should be joyful, reverent, and invite people closer to God (CCC 1832).
Return the JSON exactly as specified.`;
}

// ─── Route handler ─────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!["saints", "rosary", "memes"].includes(type)) {
      return NextResponse.json({ error: "Invalid type. Use saints | rosary | memes." }, { status: 400 });
    }

    let systemPrompt, userPrompt;

    switch (type) {
      case "saints":
        systemPrompt = SAINTS_SYSTEM;
        userPrompt = buildSaintsPrompt(body);
        break;
      case "rosary":
        systemPrompt = ROSARY_SYSTEM;
        userPrompt = buildRosaryPrompt(body);
        break;
      case "memes":
        systemPrompt = MEMES_SYSTEM;
        userPrompt = buildMemesPrompt(body);
        break;
    }

    // Single API call per forge — stream for timeout safety
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const response = await stream.finalMessage();
    const text = response.content.find((b) => b.type === "text")?.text ?? "";

    // Parse JSON from response
    let parsed;
    try {
      // Strip any accidental markdown fences
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please try again.", raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: parsed, type });
  } catch (err) {
    const status = err?.status ?? 500;
    const message =
      status === 401
        ? "Invalid API key. Check your NEXT_PUBLIC_CLAUDE_API_KEY."
        : status === 429
        ? "Rate limited. Please wait a moment and try again."
        : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status });
  }
}

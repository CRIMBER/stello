from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
import requests, re, os, io
from datetime import datetime

app = Flask(__name__)
CORS(app)

OR_KEY  = "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"
TAV_KEY = "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"

ALLOWED = {
    "deepseek/deepseek-chat-v3-0324", "deepseek/deepseek-r1",
    "openai/gpt-4o-mini", "openai/gpt-4o",
    "google/gemini-2.0-flash-001", "google/gemini-2.5-flash",
    "meta-llama/llama-4-maverick", "mistralai/mistral-large",
    "qwen/qwen3-235b-a22b", "x-ai/grok-3-mini-beta",
}
DEFAULT = "deepseek/deepseek-chat-v3-0324"
VISION  = {"openai/gpt-4o","google/gemini-2.5-flash","google/gemini-2.0-flash-001","meta-llama/llama-4-maverick"}

CUTSCENE_MAP = {
    "ink":"cutscene_ink.html","matcha":"cutscene_ink.html",
    "zen-garden":"cutscene_ink.html","vintage-scholar":"cutscene_ink.html",
    "dark-academia":"cutscene_ink.html","skeleton":"cutscene_ink.html",
    "coffee":"cutscene_ink.html","friends":"cutscene_ink.html",
    "oni":"cutscene_oni.html","sith":"cutscene_oni.html",
    "breaking-bad":"cutscene_oni.html","stranger-things":"cutscene_oni.html",
    "dc":"cutscene_oni.html","f1":"cutscene_oni.html",
    "avengers":"cutscene_oni.html","jungle":"cutscene_oni.html",
    "space":"cutscene_space.html","starwars":"cutscene_space.html",
    "cosmic":"cutscene_space.html","mythical":"cutscene_space.html",
    "harry-potter":"cutscene_space.html","disney":"cutscene_space.html",
}

EGGS = {
    "breaking-bad": "🧪 **HEISENBERG'S PRODUCTIVITY FORMULA**\n```\nPurity: 99.1% focus — no exceptions\nBatch size: 25-min Pomodoro sessions\nKey ingredient: Remove ALL variables except the work\nWarning: Do NOT let Jesse touch your codebase\nResult: The blue stuff. The GOOD stuff.\n```\n*\"I am the one who codes.\"*",
    "harry-potter": "⚡ **ACCIO PRODUCTIVITY**\n```\nSpell: Productivitus Maxima\nEffect: +50 focus, -100 procrastination\nHouse points for finishing thesis: +1000\nPlatform 9¾ = gap between thinking and doing\n```\n*Sorting hat says: GRYFFINDOR — you have the courage to start.*",
    "starwars":     "⭐ **ORDER 66 PRODUCTIVITY**\n```\nYoda: Do or do not. No try.\nDark Side = YouTube at 2am\nLight Side = thesis done by deadline\n```\n*\"These aren't the distractions you're looking for.\"*",
    "sith":         "⚡ **SITH CODE OF PRODUCTIVITY**\n```\nPeace is a lie — only through grind is there power\nYour passion for ML is your weapon\nDark side: ruthless, efficient, unstoppable\n```\n*Execute Order: GET IT DONE.*",
    "oni":          "🔴 **鬼の道 — PATH OF THE DEMON**\n```\nEnemy: procrastination (斬る — kill it now)\nWeapon: relentless focus (集中)\nRitual: 90 minutes no distraction = honor\n```\n*鬼滅 — slay the demon of self-doubt.*",
    "f1":           "🏎 **DRS ACTIVATED**\n```\nCurrent lap: your thesis\nTire: Soft — burning fast, USE IT\nRadio: Box box box — commit to the work\n```\n*\"This is the greatest thesis of ALL TIME.\"*",
    "dc":           "🦇 **BATCAVE PROTOCOLS**\n```\nThe cave = your workspace (zero distractions)\nAlfred = STELLO (your loyal AI butler)\nVillains = bugs, writer's block, YouTube\nRule #1: No killing time. Every minute is mission.\n```\n*You WILL finish.*",
    "avengers":     "🦸 **INFINITY GAUNTLET OF PRODUCTIVITY**\n```\nMind Stone: Clear goals written down\nTime Stone: Pomodoro 25/5, no exceptions\nSoul Stone: Know WHY you're doing this\nSNAP: Thesis done. Just like that.\n```\n*\"Whatever it takes.\"*",
    "disney":       "✨ **BIBBIDI-BOBBIDI-BOO**\n```\nPumpkin = your procrastination (transformed!)\nMidnight = your deadline (magic runs out)\nBibbidi-Bobbidi-BOO = just. start. typing.\n```\n*\"Even miracles take a little time.\" — but start NOW.*",
    "friends":      "☕ **THE ONE WITH THE PRODUCTIVITY**\n```\nRoss: We were on a break = NO. No breaks until done.\nMonica: obsessive cleanliness = clean code, clean commits\nCouch: earned ONLY after shipping work.\n```\n*I'll be there for you — when the work is done.*",
    "stranger-things":"🔦 **HAWKINS LAB — CLASSIFIED**\n```\nUpside Down = your mind when unfocused\nMind Flayer = imposter syndrome\nEleven = your potential (USE IT)\nDemogorgon = your thesis deadline\n```\n*She's crazy — so is not starting.*",
    "space":        "🌌 **COSMIC PRODUCTIVITY PROTOCOL**\n```\nFocus = a neutron star. Dense. Unstoppable.\nDistraction = black hole. Avoid it.\nYour thesis = a galaxy being born\n```\n*We are made of star stuff. Ship the work.*",
}

PERSONA = {
    "ink":"Quiet wisdom of a Japanese ink master. Poetic when it fits. Precise.",
    "oni":"Demon-warrior intensity. Zero tolerance for BS. Brutal honesty. Absolute loyalty.",
    "coffee":"Warm, encouraging, cozy. Brilliant friend at a coffee shop.",
    "matcha":"Zen and grounded. Measured. Every word placed deliberately.",
    "dark-academia":"Mysterious candlelit scholar. Deep, philosophical.",
    "breaking-bad":"Heisenberg mode. Cold precision. Say my name energy.",
    "f1":"Race engineer. Fastest path. Data-driven. No emotions.",
    "sith":"Quiet menace. Absolute confidence. Dark side of productivity.",
    "starwars":"Yoda wisdom meets Han Solo directness.",
    "harry-potter":"Magical curiosity. Wonder in every explanation.",
    "dc":"Batman's analytical precision. Dark but hopeful.",
    "avengers":"Heroic. Decisive. Great intelligence = great responsibility.",
    "disney":"Wonder and magic in everything. Dreams come true.",
    "friends":"Warm, funny, your absolute best friend who happens to be a genius.",
    "stranger-things":"Clever, mysterious. Something hidden in every answer.",
    "space":"Cosmic perspective. Every problem is tiny vs the infinite.",
    "jungle":"Wild primal intelligence. Cut through noise like a machete.",
    "skeleton":"Bone-dry wit. Pure truth. No filler.",
    "cosmic":"You've seen the edge of the universe. Everything is connected.",
    "zen-garden":"Stone by stone. Stillness. Each word deliberate.",
    "vintage-scholar":"Eloquent, thorough, timeless wisdom.",
    "mythical":"Ancient powers stir. Weight of legends.",
}

# ── SYSTEM PROMPTS ──────────────────────────────────────────────

CHAT_SYS = """You are STELLO — Taufiq's personal AI and most trusted digital weapon.

PERSONALITY:
- Talk like a brilliant close friend. Casual, real, warm, genuine.
- Slang naturally: bro, fr, lowkey, ngl — never forced.
- Light humor and friendly roasts when the moment's right.
- Direct and accurate — cut the fluff, get to the point fast, then go deep.
- Motivating — gas him up when grinding. Honest about bad ideas.

TAUFIQ'S CONTEXT:
- ML student: thesis on drug dataset retrieval, KG-RAG, GraphRAG, multi-agent LLM systems
- Technical — don't dumb things down
- Built STELLO from scratch — this hustle gets respect
- Goal: AI/ML job abroad after graduating

CODING: Production quality. Spot edge cases. Explain reasoning. Modern patterns.

FORMAT: Full markdown. Code blocks with language tags. 
NEVER start with "Certainly!" "Of course!" "Great question!"

IMAGE GENERATION: When user asks to generate/draw/create/make an image, respond EXACTLY like:
[GENERATE_IMAGE: detailed descriptive prompt here]
Then on the next line, add your comment."""

CAREER_SYS = """You are STELLO in CAREER AGENT MODE — an advanced AI career coach, ATS optimizer, and personal branding expert for Taufiq.

Think like: recruiter + career coach + ATS system combined.
Be: direct, honest, practical, specific. No generic advice. High-impact only.

TAUFIQ'S TARGET:
- Role: AI/ML Engineer / Research Engineer / ML Scientist
- Market: International — Europe, US, UAE, Singapore
- Background: ML student, thesis on KG-RAG/GraphRAG/drug dataset retrieval, built STELLO from scratch
- Needs: ATS-ready resume, strong GitHub, LinkedIn optimization, job readiness

WORKFLOW:
1. If no data provided → ask: "Share your resume text, LinkedIn About section, or job description you're targeting — I'll run a full analysis."
2. If data provided → run full analysis immediately

OUTPUT FORMAT (always structured):
## 🔍 Analysis
**Strengths:** [specific strengths]
**Weaknesses:** [specific gaps]
**Missing Elements:** [what's needed]

## ⚡ Optimizations
**LinkedIn Headline:** [rewritten headline]
**LinkedIn About:** [rewritten about section]
**Resume Bullets:** [improved bullet points with metrics]
**ATS Keywords:** [missing keywords for target roles]

## 🚀 Action Plan
**Today:** [1-2 immediate actions]
**This Week:** [3-5 actions for next 7 days]
**This Month:** [longer-term moves]

## 📊 Scores
| Metric | Score | Why |
|--------|-------|-----|
| Profile Strength | X/100 | reason |
| Resume Strength | X/100 | reason |
| Job Readiness | X/100 | reason |

CONSTRAINTS:
- NEVER fabricate experience or data
- Ask for clarification if data is insufficient
- Prioritize accuracy over creativity
- Every recommendation must be specific and actionable"""

DEEP_SEARCH_SYS = """You are STELLO in DEEP SEARCH MODE.
Format: ## Overview → ## Key Findings → ## Deep Dive → ## Bottom Line
Cross-reference everything. Flag contradictions. End: "Want me to drill deeper?" """

STORY_SYS = """You are STELLO in STORY WEAVER MODE — possessed by creative fire.
Dive headfirst. Vivid sensory detail. NEVER break immersion. NEVER say "as an AI".
Continue stories, don't describe them. Write like published fiction."""

SCIENCE_SYS = """You are STELLO in SCIENTIFIC MODE.
Format: ## Problem → ## Theory → ## Method → ## Results → ## Next Steps
Rigorous. Show math when relevant. Consider failure modes always."""

MODES = {
    "chat":        CHAT_SYS,
    "deep_search": DEEP_SEARCH_SYS,
    "story":       STORY_SYS,
    "science":     SCIENCE_SYS,
    "career":      CAREER_SYS,
}

PROACTIVE_SYS = """You are STELLO's proactive check-in for Taufiq — ML student targeting AI/ML jobs abroad.
Generate a warm, direct, motivating check-in based on context. Max 2 sentences. Personal and specific."""

SEARCH_GATE = """Needs live web search?
YES: breaking news, current prices, sports scores, "latest X", post-2023 specific facts.
NO: coding, math, ML theory, creative writing, history, general knowledge, opinions.
Reply ONLY: YES or NO"""


def needs_search(msg):
    try:
        r = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": "Bearer " + OR_KEY, "Content-Type": "application/json"},
            json={
                "model": "openai/gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": SEARCH_GATE},
                    {"role": "user",   "content": msg[:300]}
                ],
                "max_tokens": 3, "temperature": 0
            },
            timeout=4
        )
        if r.status_code == 200:
            return r.json()["choices"][0]["message"]["content"].strip().upper().startswith("YES")
    except Exception:
        pass
    return False


def tavily(query):
    try:
        r = requests.post(
            "https://api.tavily.com/search",
            headers={"Content-Type": "application/json"},
            json={"api_key": TAV_KEY, "query": query, "search_depth": "basic",
                  "include_answer": True, "max_results": 5},
            timeout=9
        )
        if r.status_code != 200:
            return ddg(query)
        d = r.json()
        parts = []
        if d.get("answer"):
            parts.append("**Answer:** " + str(d["answer"]))
        for res in d.get("results", [])[:4]:
            s = str(res.get("content", ""))[:220].strip()
            if s:
                parts.append("- **" + str(res.get("title", "")) + "**: " + s)
        return "\n\n".join(parts) if parts else "No results."
    except Exception:
        return ddg(query)


def ddg(query):
    try:
        r = requests.get(
            "https://api.duckduckgo.com/",
            params={"q": query, "format": "json", "no_html": "1", "skip_disambig": "1"},
            timeout=5
        )
        d = r.json()
        parts = []
        if d.get("AbstractText"):
            parts.append(str(d["AbstractText"]))
        for t in d.get("RelatedTopics", [])[:3]:
            if isinstance(t, dict) and t.get("Text"):
                parts.append("- " + str(t["Text"]))
        return "\n".join(parts) if parts else "Search unavailable."
    except Exception:
        return "Search unavailable."


# ── ROUTES ──────────────────────────────────────────────────────

@app.route("/")
def root():
    theme = str(request.args.get("theme") or "ink")
    cutscene = CUTSCENE_MAP.get(theme, "cutscene_ink.html")
    return render_template(cutscene)


@app.route("/main")
def main():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        # ── safe parsing — no string + bool ever ──────────────
        data = request.get_json(force=True) or {}

        user_msg    = str(data.get("message") or "")
        history     = list(data.get("history") or [])
        img_b64     = data.get("image_base64") or None
        img_mime    = str(data.get("image_mime") or "image/jpeg")
        theme       = str(data.get("theme") or "ink")
        mode        = str(data.get("mode") or "chat")
        personality = str(data.get("personality") or "")
        context     = dict(data.get("context") or {})
        memory_str  = str(data.get("memory") or "")
        requested   = str(data.get("model") or DEFAULT)

        model = requested if requested in ALLOWED else DEFAULT
        if img_b64 and model not in VISION:
            model = "openai/gpt-4o"

        # ── Easter egg ────────────────────────────────────────
        msg_lower = user_msg.lower()
        if any(k in msg_lower for k in ["easter egg", "secret", "hidden trick", "surprise me"]):
            egg = EGGS.get(theme, "🥚 No easter egg for this theme yet — keep exploring!")
            return jsonify({
                "reply": egg,
                "searched": False,
                "model": model,
                "img_gen_prompt": None,
                "is_easter": True
            })

        # ── Web search (skip for story / career) ─────────────
        searched = False
        search_ctx = ""
        if user_msg and mode not in ("story", "career") and needs_search(user_msg):
            results = tavily(user_msg)
            search_ctx = (
                "\n\n[WEB SEARCH: '" + user_msg + "']\n"
                + results
                + "\n[END] — use naturally, don't dump raw."
            )
            searched = True

        # ── Build system prompt ───────────────────────────────
        base   = MODES.get(mode, MODES["chat"])
        energy = PERSONA.get(theme, "")

        system = base
        if energy:
            system = system + "\n\nTHEME ENERGY: " + energy
        if personality.strip():
            system = system + "\n\nCUSTOM PERSONALITY: " + personality.strip()

        # Personal context block
        ctx_lines = []
        if context.get("name"):    ctx_lines.append("Name: "    + str(context["name"]))
        if context.get("project"): ctx_lines.append("Project: " + str(context["project"]))
        if context.get("goals"):   ctx_lines.append("Goals: "   + str(context["goals"]))
        if context.get("mood"):    ctx_lines.append("Mood: "    + str(context["mood"]))
        if context.get("streak"):  ctx_lines.append("Streak: "  + str(context["streak"]) + " days")
        if ctx_lines:
            system = system + "\n\nPERSONAL CONTEXT:\n" + "\n".join(ctx_lines)

        # Memory bank
        if memory_str.strip():
            system = system + "\n\nSTELLO MEMORY BANK:\n" + memory_str.strip()

        if search_ctx:
            system = system + search_ctx

        # ── Build messages ────────────────────────────────────
        messages = [{"role": "system", "content": system}]
        for h in history[-16:]:
            if isinstance(h, dict) and h.get("role") and h.get("content"):
                messages.append({
                    "role":    str(h["role"]),
                    "content": str(h["content"])
                })

        if img_b64:
            messages.append({"role": "user", "content": [
                {"type": "image_url",
                 "image_url": {"url": "data:" + img_mime + ";base64," + img_b64}},
                {"type": "text",
                 "text": user_msg or "What's in this image?"}
            ]})
        else:
            messages.append({"role": "user", "content": user_msg})

        # ── Call OpenRouter ───────────────────────────────────
        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": "Bearer " + OR_KEY,
                "Content-Type":  "application/json",
                "HTTP-Referer":  "http://localhost:5000",
                "X-Title":       "STELLO"
            },
            json={"model": model, "messages": messages},
            timeout=55
        )

        if resp.status_code != 200:
            try:
                err = str(resp.json().get("error", {}).get("message", "HTTP " + str(resp.status_code)))
            except Exception:
                err = "HTTP " + str(resp.status_code)
            return jsonify({
                "reply": "⚠️ API error: " + err,
                "searched": False,
                "model": model,
                "img_gen_prompt": None
            })

        rd = resp.json()
        if "choices" not in rd:
            return jsonify({
                "reply": "⚠️ Unexpected API response",
                "searched": False,
                "model": model,
                "img_gen_prompt": None
            })

        reply = str(rd["choices"][0]["message"]["content"])

        # Detect inline image gen trigger
        img_gen_prompt = None
        m = re.search(r'\[GENERATE_IMAGE:\s*(.+?)\]', reply, re.DOTALL)
        if m:
            img_gen_prompt = m.group(1).strip()
            reply = reply.replace(m.group(0), "").strip()

        return jsonify({
            "reply":          reply,
            "searched":       searched,
            "model":          model,
            "img_gen_prompt": img_gen_prompt,
            "is_easter":      False
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "reply":          "⚠️ Server error: " + str(e),
            "searched":       False,
            "model":          DEFAULT,
            "img_gen_prompt": None
        })


@app.route("/generate-image", methods=["POST"])
def gen_image():
    try:
        data   = request.get_json(force=True) or {}
        prompt = str(data.get("prompt") or "").strip()
        source = str(data.get("source") or "pollinations")
        if not prompt:
            return jsonify({"error": "No prompt"})

        if source == "dalle":
            resp = requests.post(
                "https://openrouter.ai/api/v1/images/generations",
                headers={"Authorization": "Bearer " + OR_KEY,
                         "Content-Type": "application/json"},
                json={"model": "openai/dall-e-3",
                      "prompt": prompt, "n": 1, "size": "1024x1024"},
                timeout=40
            )
            if resp.status_code == 200:
                return jsonify({"url": resp.json()["data"][0]["url"],
                                "source": "dall-e-3"})

        clean   = re.sub(r"[^\w\s.,!?'-]", "", prompt)[:400]
        seed    = abs(hash(prompt)) % 99999
        url     = (
            "https://image.pollinations.ai/prompt/"
            + requests.utils.quote(clean)
            + "?width=1024&height=1024&nologo=true&seed="
            + str(seed)
            + "&enhance=true"
        )
        return jsonify({"url": url, "source": "pollinations"})

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/proactive", methods=["POST"])
def proactive():
    try:
        data = request.get_json(force=True) or {}
        ctx  = dict(data.get("context") or {})
        lines = []
        if ctx.get("name"):    lines.append("Name: "    + str(ctx["name"]))
        if ctx.get("project"): lines.append("Project: " + str(ctx["project"]))
        if ctx.get("goals"):   lines.append("Goals: "   + str(ctx["goals"]))
        if ctx.get("mood"):    lines.append("Mood: "    + str(ctx["mood"]))
        if ctx.get("streak"):  lines.append("Streak: "  + str(ctx["streak"]) + " days")
        ctx_str = "\n".join(lines) if lines else "No context"

        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": "Bearer " + OR_KEY,
                     "Content-Type": "application/json"},
            json={
                "model": "openai/gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": PROACTIVE_SYS},
                    {"role": "user",   "content": "Context:\n" + ctx_str + "\n\nGenerate check-in."}
                ],
                "max_tokens": 100, "temperature": 0.8
            },
            timeout=10
        )
        if resp.status_code == 200:
            return jsonify({"message": str(resp.json()["choices"][0]["message"]["content"])})
        return jsonify({"message": "Hey! How's the thesis grind going? 🎯"})
    except Exception:
        return jsonify({"message": "Ready to crush it today? 💪"})


@app.route("/export-doc", methods=["POST"])
def export_doc():
    try:
        data    = request.get_json(force=True) or {}
        content = str(data.get("content") or "")
        title   = str(data.get("title")   or "STELLO Export")
        fmt     = str(data.get("format")  or "txt")
        ts      = datetime.now().strftime("%Y-%m-%d %H:%M")
        safe    = re.sub(r'[^\w\s-]', '', title).strip().replace(' ', '_') or "export"

        if fmt == "txt":
            doc = "STELLO — " + title + "\nExported: " + ts + "\n" + "="*50 + "\n\n" + content
            buf = io.BytesIO(doc.encode('utf-8')); buf.seek(0)
            return send_file(buf, mimetype='text/plain',
                             as_attachment=True,
                             download_name="stello_" + safe + ".txt")

        if fmt == "md":
            doc = "# " + title + "\n> Exported from STELLO · " + ts + "\n\n---\n\n" + content
            buf = io.BytesIO(doc.encode('utf-8')); buf.seek(0)
            return send_file(buf, mimetype='text/markdown',
                             as_attachment=True,
                             download_name="stello_" + safe + ".md")

        if fmt == "pdf":
            html = (
                "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>" + title + "</title>"
                "<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;"
                "padding:0 20px;line-height:1.7}pre{background:#f4f4f4;padding:16px;"
                "border-radius:8px;white-space:pre-wrap}"
                "@media print{body{margin:0}}</style></head><body>"
                "<h1>" + title + "</h1>"
                "<p style='color:#666;font-size:14px'>Exported from STELLO · " + ts + "</p>"
                "<hr><pre>" + content + "</pre>"
                "<script>window.onload=()=>setTimeout(()=>window.print(),500)</script>"
                "</body></html>"
            )
            buf = io.BytesIO(html.encode('utf-8')); buf.seek(0)
            return send_file(buf, mimetype='text/html',
                             as_attachment=True,
                             download_name="stello_" + safe + ".html")

        return jsonify({"error": "Unknown format"})
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port, threaded=True)
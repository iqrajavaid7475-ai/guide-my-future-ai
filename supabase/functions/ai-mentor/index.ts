// AI Mentor + Roadmap generator using Lovable AI Gateway
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Profile {
  full_name?: string | null;
  education_level?: string | null;
  field_of_interest?: string | null;
  skills?: string[] | null;
  career_goal?: string | null;
  country?: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authedClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const { mode, messages, goal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");

    // --- Server-fetched profile (no client trust) ---
    const { data: profileRow } = await authedClient
      .from("profiles")
      .select("full_name,education_level,field_of_interest,skills,career_goal,country")
      .eq("id", user.id)
      .single();
    const p: Profile = profileRow ?? {};

    const profileSummary = `User profile:
- Name: ${p.full_name ?? "Unknown"}
- Country: ${p.country ?? "n/a"}
- Education: ${p.education_level ?? "n/a"}
- Field of interest: ${p.field_of_interest ?? "n/a"}
- Skills: ${(p.skills ?? []).join(", ") || "n/a"}
- Career goal: ${p.career_goal ?? "n/a"}`;

    let body: Record<string, unknown>;

    if (mode === "roadmap") {
      const sys = `You are FuturePath AI, an expert career and education mentor. Generate a deeply personalized, actionable career roadmap. Return ONLY valid JSON matching this schema:
{
  "title": string,
  "summary": string (2-3 sentences),
  "duration_months": number,
  "phases": [
    {
      "title": string,
      "duration": string,
      "objective": string,
      "milestones": [string],
      "skills_to_learn": [string],
      "recommended_resources": [{"name": string, "type": "course"|"book"|"certification"|"project", "provider": string}]
    }
  ],
  "key_opportunities": [{"type": "scholarship"|"internship"|"job"|"course", "title": string, "why": string}]
}
4-6 phases. No markdown, no commentary, JSON only.`;
      const safeGoal = typeof goal === "string" ? goal.slice(0, 500) : "";
      body = {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `${profileSummary}\n\nGoal: ${safeGoal || p.career_goal || "Build a successful career"}\n\nGenerate the roadmap JSON now.` },
        ],
        response_format: { type: "json_object" },
      };
    } else {
      const sys = `You are FuturePath AI — a warm, sharp, motivating career & education mentor for students and young professionals. Give concrete, actionable advice. Use short paragraphs, bullet points where useful. Reference the user's profile when relevant. Tone: encouraging, expert, modern.

${profileSummary}`;
      // Load chat history from DB (do not trust client-supplied history).
      const { data: history } = await authedClient
        .from("chat_messages")
        .select("role,content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(40);
      const safeHistory = (history ?? []).filter(
        (m: { role?: string; content?: string }) =>
          (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
      );
      // Client-supplied messages are ignored; latest user turn is already persisted.
      const convo = safeHistory;
      body = {
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: sys }, ...convo],
        stream: true,
      };
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (mode === "roadmap") {
      const data = await aiRes.json();
      const content = data.choices?.[0]?.message?.content ?? "{}";
      let parsed;
      try { parsed = JSON.parse(content); } catch { parsed = { title: "Your Roadmap", summary: content, phases: [] }; }
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(aiRes.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("ai-mentor error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

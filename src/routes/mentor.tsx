import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, Bot, User as UserIcon, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mentor")({
  head: () => ({ meta: [{ title: "AI Mentor · FuturePath AI" }, { name: "description", content: "Chat with your personalized AI career mentor." }] }),
  component: MentorPage,
});

interface Msg { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "What should I focus on this week?",
  "How do I switch into AI from another field?",
  "Suggest a 30-day study plan",
  "How do I prep for my first internship interview?",
];

function MentorPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth", search: { mode: "signin" } }); return; }
    if (!profile?.onboarded) { navigate({ to: "/onboarding" }); return; }
    (async () => {
      const { data } = await supabase.from("chat_messages").select("role,content").order("created_at", { ascending: true }).limit(50);
      if (data && data.length) setMessages(data as Msg[]);
    })();
  }, [user, profile, loading]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text: string) => {
    if (!text.trim() || !user || streaming) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: userMsg.content });

    let assistantSoFar = "";
    setMessages((p) => [...p, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ mode: "chat", profile, messages: next }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status}`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content as string | undefined;
            if (c) {
              assistantSoFar += c;
              setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      if (assistantSoFar) await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: assistantSoFar });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Mentor unavailable";
      toast.error(msg);
      setMessages((p) => p.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  if (loading || !profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 py-8 lg:py-12 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 pb-5 border-b border-border">
        <div className="size-10 rounded-xl bg-hero flex items-center justify-center shadow-glow"><Bot className="size-5 text-white" /></div>
        <div>
          <h1 className="font-display text-xl font-semibold">AI Mentor</h1>
          <p className="text-xs text-muted-foreground">Personalized to your profile · powered by AI</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-5">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="size-14 rounded-2xl bg-hero shadow-glow grid place-items-center mx-auto"><Sparkles className="size-6 text-white" /></div>
            <h2 className="font-display text-2xl font-semibold mt-5">How can I help you today?</h2>
            <p className="text-sm text-muted-foreground mt-2">Ask about scholarships, careers, study plans — anything.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-left text-sm rounded-xl border border-border bg-card p-3 hover:bg-secondary transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && <div className="size-8 rounded-lg bg-hero flex items-center justify-center shrink-0"><Bot className="size-4 text-white" /></div>}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "bg-foreground text-background" : "bg-card border border-border"}`}>
              {m.content || <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> thinking…</span>}
            </div>
            {m.role === "user" && <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><UserIcon className="size-4" /></div>}
          </div>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="pt-4 border-t border-border">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask your mentor anything…"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-h-32"
          />
          <button type="submit" disabled={streaming || !input.trim()} className="size-12 rounded-2xl bg-hero text-white grid place-items-center disabled:opacity-40 hover:opacity-90 transition-opacity shadow-glow">
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

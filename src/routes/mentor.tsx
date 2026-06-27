import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Briefcase,
  GraduationCap,
  Map,
  Lightbulb,
  Plane,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mentor")({
  head: () => ({
    meta: [
      { title: "AI Mentor · FuturePath AI" },
      { name: "description", content: "Chat with your personalized AI career mentor." },
    ],
  }),
  component: MentorPage,
});

interface Msg {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

const QUICK_CHIPS: { label: string; icon: typeof Briefcase; prompt: string }[] = [
  {
    label: "Career Advice",
    icon: Briefcase,
    prompt: "Give me personalized career advice based on my profile and current goals.",
  },
  {
    label: "Scholarship Search",
    icon: GraduationCap,
    prompt: "Help me find scholarships that match my background and field of interest.",
  },
  {
    label: "Roadmap Planning",
    icon: Map,
    prompt: "Build me a step-by-step roadmap to reach my career goal.",
  },
  {
    label: "Skill Development",
    icon: Lightbulb,
    prompt: "What skills should I learn next, and how should I learn them?",
  },
  {
    label: "Study Abroad",
    icon: Plane,
    prompt: "Guide me through studying abroad — countries, universities, and how to apply.",
  },
];

function formatTime(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function MentorPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", search: { mode: "signin" } });
      return;
    }
    if (!profile?.onboarded) {
      navigate({ to: "/onboarding" });
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("role,content,created_at")
        .order("created_at", { ascending: true })
        .limit(100);
      if (data && data.length) setMessages(data as Msg[]);
      inputRef.current?.focus();
    })();
  }, [user, profile, loading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  const send = async (text: string) => {
    if (!text.trim() || !user || streaming) return;
    const now = new Date().toISOString();
    const userMsg: Msg = { role: "user", content: text.trim(), created_at: now };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);
    await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, role: "user", content: userMsg.content });

    let assistantSoFar = "";
    setMessages((p) => [
      ...p,
      { role: "assistant", content: "", created_at: new Date().toISOString() },
    ]);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Please sign in again");
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ mode: "chat", messages: next }),
        },
      );
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
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content as string | undefined;
            if (c) {
              assistantSoFar += c;
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
                ),
              );
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      if (assistantSoFar)
        await supabase
          .from("chat_messages")
          .insert({ user_id: user.id, role: "assistant", content: assistantSoFar });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Mentor unavailable";
      toast.error(msg);
      setMessages((p) => p.slice(0, -1));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    if (!user) return;
    if (!confirm("Clear the entire conversation? This cannot be undone.")) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([]);
    toast.success("Conversation cleared");
  };

  if (loading || !profile)
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
        Loading…
      </div>
    );

  const isEmpty = messages.length === 0;

  return (
    <div className="mx-auto max-w-4xl w-full px-3 sm:px-6 lg:px-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 py-3 sm:py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-2xl bg-hero flex items-center justify-center shadow-glow shrink-0">
            <Bot className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-lg font-semibold truncate">
              AI Mentor
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Online · Personalized to your profile
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-secondary"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 sm:py-6">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="size-16 rounded-3xl bg-hero shadow-glow grid place-items-center">
              <Sparkles className="size-7 text-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-5 tracking-tight">
              How can I help you today
              {profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}?
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Ask me anything about your career, scholarships, study plans, or skills.
              Pick a starter below or type your own.
            </p>
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-w-2xl w-full">
              {QUICK_CHIPS.map((c) => (
                <button
                  key={c.label}
                  onClick={() => send(c.prompt)}
                  className="group flex flex-col items-start gap-2 text-left rounded-2xl border border-border bg-card p-3 sm:p-4 hover:border-primary/40 hover:shadow-elevated hover:-translate-y-0.5 transition-all"
                >
                  <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <c.icon className="size-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium leading-tight">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const isLast = i === messages.length - 1;
              const isPending = !isUser && isLast && streaming && !m.content;
              return (
                <div
                  key={i}
                  className={`flex gap-2.5 sm:gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isUser
                        ? "bg-secondary text-foreground"
                        : "bg-hero text-white shadow-glow"
                    }`}
                  >
                    {isUser ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
                  </div>
                  <div
                    className={`flex flex-col max-w-[82%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2.5 sm:py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-card border border-border rounded-tl-sm"
                      }`}
                    >
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 py-1">
                          <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                          <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                          <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                        </span>
                      ) : (
                        m.content
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {formatTime(m.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="pt-3 pb-4 sm:pb-6 border-t border-border bg-background/80 backdrop-blur sticky bottom-0">
        {!isEmpty && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {QUICK_CHIPS.map((c) => (
              <button
                key={c.label}
                onClick={() => send(c.prompt)}
                disabled={streaming}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 transition-colors"
              >
                <c.icon className="size-3.5 text-primary" />
                {c.label}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 items-end"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Message AI Mentor…"
              rows={1}
              disabled={streaming}
              className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 max-h-40 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            aria-label="Send message"
            className="size-12 rounded-2xl bg-hero text-white grid place-items-center disabled:opacity-40 hover:opacity-90 transition-opacity shadow-glow shrink-0"
          >
            <Send className="size-4" />
          </button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-2 px-2">
          AI Mentor can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}

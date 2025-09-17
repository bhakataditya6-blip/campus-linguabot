import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageCode, ChatResponse, HandoffResponse } from "@shared/api";
import { cn } from "@/lib/utils";
import { Loader2, SendHorizonal, User2, Bot, LifeBuoy } from "lucide-react";

const LANG_LABEL: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिन्दी",
  bn: "বাংলা",
  mr: "मराठी",
  ta: "தமிழ்",
};

type ClientLanguage = LanguageCode | "auto";

export function ChatWidget() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [language, setLanguage] = useState<ClientLanguage>("auto");
  const [input, setInput] = useState("");
  const [items, setItems] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { role: "assistant", text: "Welcome! Ask about fee deadlines, scholarships, or timetable updates." },
  ]);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [items.length]);

  async function send() {
    const message = input.trim();
    if (!message) return;
    setItems((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);
    setFallback(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message, language: language === "auto" ? undefined : language }),
      });
      const data = (await res.json()) as ChatResponse;
      setItems((prev) => [...prev, { role: "assistant", text: data.answer }]);
      setFallback(data.fallbackToHuman);
    } catch (e) {
      setItems((prev) => [
        ...prev,
        { role: "assistant", text: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div id="demo" className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 via-accent/10 to-transparent">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </div>
            <div>
              <p className="font-semibold leading-tight">Campus Assistant</p>
              <p className="text-xs text-foreground/60">Understands your campus queries</p>
            </div>
          </div>
          <div className="w-[160px]">
            <Select onValueChange={(v) => setLanguage(v as ClientLanguage)} defaultValue="auto">
              <SelectTrigger aria-label="Language">
                <SelectValue placeholder="Auto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto detect</SelectItem>
                {Object.entries(LANG_LABEL).map(([code, label]) => (
                  <SelectItem key={code} value={code}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div ref={listRef} className="h-[420px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-secondary">
        {items.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}> 
            {m.role === "assistant" && (
              <div className="mt-1 size-6 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center">
                <Bot className="size-4" />
              </div>
            )}
            <div className={cn(
              "max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm",
              m.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border"
            )}>
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="mt-1 size-6 shrink-0 rounded-full bg-accent text-accent-foreground grid place-items-center">
                <User2 className="size-4" />
              </div>
            )}
          </div>
        ))}
        {fallback && (
          <div className="rounded-lg border p-3 text-sm bg-secondary/60">
            <div className="flex items-center gap-2 font-medium"><LifeBuoy className="size-4"/> Need human assistance?</div>
            <HandoffForm sessionId={sessionId} />
          </div>
        )}
      </div>

      <div className="border-t p-3 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your question…"
          aria-label="Message"
        />
        <Button onClick={send} disabled={loading} className="px-3">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}

function HandoffForm({ sessionId }: { sessionId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name, email, phone, note }),
      });
      const data = (await res.json()) as HandoffResponse;
      if (data.ok) setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) return <p className="mt-2 text-xs text-foreground/70">Thanks. A staff member will follow up.</p>;

  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" />
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" aria-label="Email" />
      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" aria-label="Phone" />
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Additional details (optional)" className="sm:col-span-2" aria-label="Additional details" />
      <div className="sm:col-span-2 flex justify-end">
        <Button size="sm" onClick={submit} disabled={loading || !name.trim()}>Request human help</Button>
      </div>
    </div>
  );
}

export default ChatWidget;

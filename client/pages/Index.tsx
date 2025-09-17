import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Languages, ShieldCheck, CircuitBoard, FileText, LineChart } from "lucide-react";
import ChatWidget from "@/components/chat/ChatWidget";

export default function Index() {
  useEffect(() => {
    // noop: kept for potential future preload
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.primary/15),transparent_50%),radial-gradient(ellipse_at_bottom_right,theme(colors.accent/15),transparent_50%)]" />
        <div className="container relative py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-3">
              <span className="size-2 rounded-full bg-primary" /> Language Agnostic Chatbot
            </p>
            <h1 className="text-4xl/tight md:text-5xl/tight font-extrabold tracking-tight">
              Multilingual campus assistant for equitable access
            </h1>
            <p className="mt-4 text-foreground/70 text-lg">
              Answers routine queries in Hindi, English, Bengali, Marathi and Tamil. Maintains context, logs conversations daily, and offers human handoff when needed.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#demo"><Button size="lg">Start chatting</Button></a>
              <a href="#features"><Button size="lg" variant="outline">See features</Button></a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-foreground/70">
              <div className="flex items-center gap-1"><ShieldCheck className="size-4 text-primary"/> Privacy-first logging</div>
              <div className="flex items-center gap-1"><LineChart className="size-4 text-primary"/> Daily improvement insights</div>
            </div>
          </div>
          <div className="md:pl-8">
            <ChatWidget />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Built for real campus needs</h2>
          <p className="mt-3 text-foreground/70">Reduce queues and communication gaps by answering repetitive queries conversationally across languages.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Languages className="size-5" />} title="Five languages" desc="Understands and responds in Hindi, English, Bengali, Marathi and Tamil with auto-detect." />
          <Feature icon={<CircuitBoard className="size-5" />} title="Context aware" desc="Maintains topic context across follow-up questions within a session." />
          <Feature icon={<ShieldCheck className="size-5" />} title="Privacy-first" desc="Masks emails and phone numbers in logs; no external keys required to start." />
          <Feature icon={<FileText className="size-5" />} title="Content curation" desc="Ground answers in college circulars/FAQs to improve accuracy." />
          <Feature icon={<CheckCircle2 className="size-5" />} title="Human handoff" desc="Request staff assistance directly from the chat when confidence is low." />
          <Feature icon={<LineChart className="size-5" />} title="Daily logs" desc="Conversation logs written per day for review and continuous improvement." />
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="py-16 bg-secondary/50">
        <div className="container">
          <h3 className="text-2xl font-semibold">Supported languages</h3>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ["English", "EN"],
              ["हिन्दी", "HI"],
              ["বাংলা", "BN"],
              ["मराठी", "MR"],
              ["தமிழ்", "TA"],
            ].map(([name, code]) => (
              <span key={code} className="px-3 py-1 rounded-full border text-sm bg-background">{name} <span className="text-foreground/60">· {code}</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="container py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-3xl font-bold">Privacy and accuracy</h3>
            <p className="mt-3 text-foreground/70">Sensitive details like emails and phone numbers are masked before logging. Responses are grounded in curated content to ensure reliability.</p>
            <ul className="mt-6 space-y-2 text-foreground/80">
              {[
                "Mask emails and phone numbers in logs",
                "Daily JSONL logs for audits and improvement",
                "Clear escalation to human staff when needed",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="md:pl-8">
            <div className="rounded-xl border p-6 bg-card">
              <h4 className="font-semibold">How embedding works</h4>
              <ol className="mt-3 space-y-2 text-sm text-foreground/70 list-decimal list-inside">
                <li>Place the widget on the college website home or help page.</li>
                <li>Connect messaging channels (WhatsApp, Telegram) using the same API.</li>
                <li>Curate FAQs/circulars; update content periodically.</li>
              </ol>
              <div className="mt-4">
                <a href="#demo"><Button>Open the assistant</Button></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embed */}
      <section id="embed" className="container py-16">
        <div className="rounded-2xl border p-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div>
              <h4 className="text-xl font-semibold">Ready to integrate</h4>
              <p className="text-foreground/70">Add the assistant to your site and messaging channels. Maintainable by student volunteers.</p>
            </div>
            <a href="#demo"><Button size="lg">Try it now</Button></a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border p-5 bg-card">
      <div className="flex items-center gap-2 mb-2 text-primary">{icon}<span className="font-medium text-foreground">{title}</span></div>
      <p className="text-sm text-foreground/70">{desc}</p>
    </div>
  );
}

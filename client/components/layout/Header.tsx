import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "#features", label: "Features" },
  { href: "#languages", label: "Languages" },
  { href: "#privacy", label: "Privacy" },
  { href: "#embed", label: "Embed" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-gradient-to-br from-primary to-accent" />
          <span className="font-extrabold tracking-tight text-lg">Campus LinguaBot</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className={cn("text-foreground/70 hover:text-foreground transition-colors")}>{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#demo">
            <Button size="sm">Try Assistant</Button>
          </a>
        </div>
      </div>
    </header>
  );
}

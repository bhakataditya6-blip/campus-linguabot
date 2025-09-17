export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="container py-12 grid gap-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-gradient-to-br from-primary to-accent" />
            <span className="font-semibold">Campus LinguaBot</span>
          </div>
          <p className="mt-3 text-sm text-foreground/70 max-w-sm">
            Multilingual campus assistant providing equitable, round-the-clock information access.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium mb-3">Overview</p>
          <ul className="space-y-2 text-foreground/70">
            <li><a href="#features" className="hover:text-foreground">Features</a></li>
            <li><a href="#privacy" className="hover:text-foreground">Privacy</a></li>
            <li><a href="#embed" className="hover:text-foreground">Embedding</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium mb-3">Support</p>
          <ul className="space-y-2 text-foreground/70">
            <li>Daily logs for continuous improvement</li>
            <li>Student-volunteer maintainable</li>
            <li>No external keys required to start</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-6 text-xs text-foreground/60 flex justify-between">
          <span>© {new Date().getFullYear()} Campus LinguaBot</span>
          <a href="#privacy" className="hover:text-foreground">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

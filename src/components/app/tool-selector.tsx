import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export function ToolSelector() {
  return (
    <div className="mx-auto flex w-full max-w-md items-center gap-2.5 px-1 sm:gap-3 sm:px-0">
      <Link
        href="/tool"
        className="min-w-0 flex-1 whitespace-nowrap rounded-full bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
      >
        PDF Tool
      </Link>

      <Link
        href="/exam-optimizer"
        className="min-w-0 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-primary/95 via-violet-500/90 to-fuchsia-500/85 px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_6px_18px_hsl(var(--primary)/0.24)] transition-all hover:shadow-[0_8px_20px_hsl(var(--primary)/0.3)] sm:px-4"
      >
        <span>AI Optimizer</span>
        <Badge className="rounded-full bg-background/15 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide text-white hover:bg-background/15">
          AI
        </Badge>
      </Link>
    </div>
  );
}

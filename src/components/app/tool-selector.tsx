'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ToolSelector() {
  const pathname = usePathname();
  const isAiActive = pathname === '/exam-optimizer';

  const tabBaseClass =
    'min-w-0 flex-1 rounded-full px-3 py-2.5 text-center text-sm font-semibold transition-all duration-200';

  return (
    <div className="mx-auto w-full max-w-md rounded-full bg-white/5 p-1 backdrop-blur-sm">
      <div className="flex items-center">
        <Link
          href="/tool"
          className={`${tabBaseClass} ${
            !isAiActive
              ? 'bg-gradient-to-r from-primary to-violet-500 text-primary-foreground shadow-[0_6px_16px_hsl(var(--primary)/0.28)]'
              : 'bg-transparent text-white/70 hover:text-white/90'
          }`}
        >
          PDF Tool
        </Link>

        <Link
          href="/exam-optimizer"
          className={`${tabBaseClass} ${
            isAiActive
              ? 'bg-gradient-to-r from-primary to-violet-500 text-primary-foreground shadow-[0_6px_16px_hsl(var(--primary)/0.28)]'
              : 'bg-transparent text-white/70 hover:text-white/90'
          }`}
        >
          AI Optimizer
        </Link>
      </div>
    </div>
  );
}

'use client';

type ToolTab = 'pdf' | 'ai';

interface ToolSelectorProps {
  activeTab: ToolTab;
  onTabChange: (tab: ToolTab) => void;
}

export function ToolSelector({ activeTab, onTabChange }: ToolSelectorProps) {
  const tabBaseClass =
    'min-w-0 flex-1 rounded-full px-3 py-2.5 text-center text-sm font-semibold transition-all duration-300';

  return (
    <div className="mx-auto w-full max-w-md rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onTabChange('pdf')}
          className={`${tabBaseClass} ${
            activeTab === 'pdf'
              ? 'bg-gradient-to-r from-primary to-violet-500 text-primary-foreground shadow-[0_6px_16px_hsl(var(--primary)/0.28)]'
              : 'bg-transparent text-white/65 hover:text-white/90'
          }`}
        >
          PDF Tool
        </button>

        <button
          type="button"
          onClick={() => onTabChange('ai')}
          className={`${tabBaseClass} ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-primary to-violet-500 text-primary-foreground shadow-[0_6px_16px_hsl(var(--primary)/0.28)]'
              : 'bg-transparent text-white/65 hover:text-white/90'
          }`}
        >
          AI Optimizer
        </button>
      </div>
    </div>
  );
}

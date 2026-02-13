'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, Users, Heart, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/support', label: 'Support', icon: Heart },
  { href: '/', label: 'Home', icon: Home },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
      <nav className="fixed bottom-0 z-50 block w-full border-t border-white/10 bg-background/80 backdrop-blur-lg md:hidden">
        <div className="mx-auto grid h-16 max-w-sm grid-cols-5 items-center justify-center px-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group flex flex-col items-center justify-center rounded-lg p-2 transition-colors hover:bg-primary/10',
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="mt-1 text-xs font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
  );
}

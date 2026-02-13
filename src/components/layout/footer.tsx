'use client';

import Link from 'next/link';
import { Layers, Twitter, Instagram, Youtube, Send, Link2 } from 'lucide-react';

const socialLinks = [
  { href: 'https://x.com/EduSlideAi', icon: Twitter, label: 'Twitter' },
  { href: 'https://www.instagram.com/eduslide.in', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com/@EduslideAi', icon: Youtube, label: 'YouTube' },
  { href: 'https://t.me/EduSlide', icon: Send, label: 'Telegram' },
  { href: 'https://discord.gg/ggtSC7umq', icon: Link2, label: 'Discord' },
];

const footerLinks = [
    { href: '/about', label: 'About' },
    { href: '/community', label: 'Community' },
    { href: '/support', label: 'Support' },
    { href: '/help', label: 'Help' },
    { href: '#', label: 'Privacy Policy' }, // Placeholder
    { href: '#', label: 'Terms of Service' }, // Placeholder
];

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center md:items-start">
                 <a href="/" className="mb-4 flex items-center gap-2">
                    <Layers className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">EduSlide</h1>
                </a>
                <p className="text-center text-sm text-muted-foreground md:text-left">
                    © {new Date().getFullYear()} EduSlide. Made with ❤️ for Students.
                </p>
            </div>
          
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                {footerLinks.map((link) => (
                    <Link key={link.label} href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                    <Link key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary">
                        <social.icon className="h-5 w-5" />
                        <span className="sr-only">{social.label}</span>
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </footer>
  );
}

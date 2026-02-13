import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Twitter, Instagram, Youtube, Send, Link2 as Discord, Zap, MessageSquare, Star, ArrowRight } from 'lucide-react';

const socialPlatforms = [
    { name: 'Discord', href: 'https://discord.gg/ggtSC7umq', icon: Discord, description: "Join live discussions & get help." },
    { name: 'Telegram', href: 'https://t.me/EduSlide', icon: Send, description: "Get instant updates & announcements." },
    { name: 'Twitter/X', href: 'https://x.com/EduSlideAi', icon: Twitter, description: "Follow us for quick tips & news." },
    { name: 'Instagram', href: 'https://www.instagram.com/eduslide.in', icon: Instagram, description: "See behind-the-scenes content." },
    { name: 'YouTube', href: 'https://youtube.com/@EduslideAi', icon: Youtube, description: "Watch tutorials and feature demos." },
];

const whyJoin = [
    { icon: Star, text: "Early access to new features" },
    { icon: Zap, text: "Productivity and study tips" },
    { icon: MessageSquare, text: "Direct support from the team" },
];

export default function CommunityPage() {
  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 md:py-20">
      <div className="space-y-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Join Our Community</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Connect with thousands of students and teachers who use EduSlide to improve their study workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {socialPlatforms.map((platform) => (
            <Link key={platform.name} href={platform.href} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="glassmorphic h-full transform transition-all duration-300 hover:-translate-y-2 glow-on-hover">
                <CardHeader className="flex-row items-center gap-4">
                  <platform.icon className="h-8 w-8 text-primary" />
                  <CardTitle>{platform.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{platform.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle className="text-center">Why Join?</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
                    {whyJoin.map((item) => (
                        <div key={item.text} className="flex flex-col items-center">
                            <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                                <item.icon className="h-7 w-7" />
                            </div>
                            <p className="font-semibold">{item.text}</p>
                        </div>
                    ))}
                </div>
                 <div className="mt-8 text-center">
                    <Button asChild size="lg">
                        <Link href="https://discord.gg/ggtSC7umq" target="_blank" rel="noopener noreferrer">
                            Join Discord Now <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

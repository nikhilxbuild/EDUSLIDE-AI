import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Rocket, Eye, Gem, Zap, Shield, BookOpen, Heart } from 'lucide-react';

const values = [
    { icon: Users, title: "Student First", description: "Every feature is designed for learners." },
    { icon: Heart, title: "Free Forever", description: "No hidden charges, ever." },
    { icon: Shield, title: "Privacy Focused", description: "Your files are never misused or stored." },
    { icon: Zap, title: "Performance Driven", description: "Fast and reliable tools that just work." },
    { icon: BookOpen, title: "Simplicity", description: "Easy to use for everyone, no learning curve." },
];

const whatWeDo = [
    "Browser-based PDF processing",
    "Smart layout optimization",
    "Advanced N-Up printing",
    "Color enhancement tools",
    "AI-assisted improvements",
    "Secure document handling",
];

export default function AboutPage() {
  return (
    <>
      <div className="container mx-auto max-w-5xl px-4 pt-8 pb-12 md:pt-12 md:pb-20">
      <div className="space-y-12">
          <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About EduSlide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              EduSlide is built for students and teachers who want clean, printable study material without wasting time and money. We believe learning should be simple and tools should work for you.
          </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
              <Card className="glassmorphic">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Rocket /> Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground">To help students convert digital notes into high-quality printable documents quickly, affordably, and reliably. We aim to remove technical barriers so students can focus only on learning.</p>
                  </CardContent>
              </Card>
              <Card className="glassmorphic">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Eye /> Our Vision</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground">To become India’s most trusted study productivity platform for students and educators, empowering millions to learn more effectively.</p>
                  </CardContent>
              </Card>
          </div>
          
          <Card className="glassmorphic">
              <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2"><Gem /> Our Core Values</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {values.map(item => (
                          <div key={item.title} className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                  <item.icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                  <h3 className="font-semibold">{item.title}</h3>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>

          <Card className="glassmorphic">
              <CardHeader>
                  <CardTitle className="text-center">What We Do</CardTitle>
              </CardHeader>
              <CardContent>
                  <ul className="grid grid-cols-2 gap-4 text-muted-foreground">
                      {whatWeDo.map(item => (
                          <li key={item} className="flex items-center space-x-3">
                              <Zap className="h-5 w-5 text-primary" />
                              <span>{item}</span>
                          </li>
                      ))}
                  </ul>
              </CardContent>
          </Card>

          <Card className="glassmorphic">
              <CardHeader>
                  <CardTitle className="text-center">Our Story</CardTitle>
              </CardHeader>
              <CardContent className="text-center max-w-3xl mx-auto">
                  <p className="text-muted-foreground">
                      EduSlide was born out of personal frustration. As a student, I constantly battled with messy PDFs, wasting hours trying to arrange lecture notes for printing, only to end up with poorly formatted pages. The money spent on re-prints and the time lost that could have been used for studying was immense.
                  </p>
                  <p className="text-muted-foreground mt-4">
                      I knew there had to be a better way. While learning to code, I decided to build the solution myself—a simple, free, and powerful tool designed for the specific needs of students like me.
                  </p>
                  <p className="text-muted-foreground mt-4">
                      This platform is the result of that journey. It's built by a student, for students, with the goal of helping you save time, reduce costs, and most importantly, focus on what truly matters: learning.
                  </p>
              </CardContent>
          </Card>

      </div>
      </div>
    </>
  );
}

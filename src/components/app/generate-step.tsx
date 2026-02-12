'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GenerateStepProps {
  onGenerated: () => void;
}

export function GenerateStep({ onGenerated }: GenerateStepProps) {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 5));
    }, 200);

    const finishTimer = setTimeout(() => {
      clearInterval(timer);
      setProgress(100);
      onGenerated();
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimer);
    };
  }, [onGenerated]);

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-6 text-center">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Generating your PDF...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we prepare your optimized document. This might
              take a moment.
            </p>
            <Progress value={progress} className="w-full" />
            <p className="text-sm font-medium text-primary">{progress}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

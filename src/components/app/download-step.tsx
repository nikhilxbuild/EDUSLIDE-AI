'use client';

import { Download, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DownloadStepProps {
  generatedPdf: Uint8Array | null;
  onStartOver: () => void;
  fileName: string;
}

export function DownloadStep({ generatedPdf, onStartOver, fileName }: DownloadStepProps) {
  const handleDownloadAgain = () => {
    if (!generatedPdf) return;

    const blob = new Blob([generatedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="glassmorphic w-full max-w-lg">
      <CardContent className="p-8">
        <div className="flex w-full flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Your PDF is Ready!</h2>
            <p className="text-muted-foreground">
              Your download should have started automatically. If not, use the button
              below.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Button
              size="lg"
              onClick={handleDownloadAgain}
              disabled={!generatedPdf}
            >
              <Download className="mr-2" />
              Download Again
            </Button>
            <Button size="lg" variant="outline" onClick={onStartOver}>
              <RotateCcw className="mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

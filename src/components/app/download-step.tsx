'use client';

import Image from 'next/image';
import { Download, RotateCcw } from 'lucide-react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DownloadStepProps {
  generatedPdf: Uint8Array | null;
  onStartOver: () => void;
}

export function DownloadStep({ generatedPdf, onStartOver }: DownloadStepProps) {
  const previewImage = PlaceHolderImages.find((p) => p.id === 'pdf-preview');

  const handleDownloadAgain = () => {
    if (!generatedPdf) return;

    const blob = new Blob([generatedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eduslide-output.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Your PDF is Ready!</h2>
        <p className="text-muted-foreground">
          Your download should have started automatically. If not, use the button
          below.
        </p>
      </div>

      <Card className="w-full max-w-2xl overflow-hidden">
        <CardContent className="p-4">
          {previewImage && (
            <Image
              src={previewImage.imageUrl}
              alt={previewImage.description}
              width={600}
              height={840}
              className="mx-auto rounded-md"
              data-ai-hint={previewImage.imageHint}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row">
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
  );
}

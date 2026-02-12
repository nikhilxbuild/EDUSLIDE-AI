'use client';

import { useState, useMemo, useEffect } from 'react';
import { Layers } from 'lucide-react';

import type { Page, CustomizationOptions } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { UploadStep } from '@/components/app/upload-step';
import { ReorderStep } from '@/components/app/reorder-step';
import { CustomizeStep } from '@/components/app/customize-step';
import { GenerateStep } from '@/components/app/generate-step';
import { DownloadStep } from '@/components/app/download-step';
import { StepIndicator } from '@/components/app/step-indicator';

const STEPS = [
  { id: 'upload', title: 'Upload' },
  { id: 'reorder', title: 'Arrange' },
  { id: 'customize', title: 'Customize' },
  { id: 'download', title: 'Download' },
];

export default function Home() {
  const [step, setStep] = useState<
    'upload' | 'reorder' | 'customize' | 'generating' | 'download'
  >('upload');
  const [pages, setPages] = useState<Page[]>([]);
  const [customization, setCustomization] = useState<CustomizationOptions>({
    rows: 2,
    cols: 2,
    orientation: 'portrait',
    margin: 'default',
    colorMode: 'normal',
    removeBlankPages: true,
    cropBorders: false,
  });

  const pagePlaceholders = useMemo(
    () => PlaceHolderImages.filter((p) => p.id.startsWith('page-')),
    []
  );

  const handleUpload = () => {
    const dummyPages = pagePlaceholders.slice(0, 16).map((p, i) => ({
      id: i,
      sourceUrl: p.imageUrl,
      sourceHint: p.imageHint,
      selected: true,
    }));
    setPages(dummyPages);
    setStep('reorder');
  };

  const handleGenerate = () => {
    setStep('generating');
  };

  const handleStartOver = () => {
    setPages([]);
    setStep('upload');
  };

  const currentStepIndex = useMemo(() => {
    if (step === 'upload') return 0;
    if (step === 'reorder') return 1;
    if (step === 'customize') return 2;
    if (step === 'generating') return 2; // Still on customize visually
    if (step === 'download') return 3;
    return 0;
  }, [step]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Layers className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">EduSlide</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full space-y-8">
          {step !== 'upload' && step !== 'generating' && (
            <StepIndicator steps={STEPS} currentStep={currentStepIndex} />
          )}

          {step === 'upload' && <UploadStep onUpload={handleUpload} />}
          {step === 'reorder' && (
            <ReorderStep
              pages={pages}
              setPages={setPages}
              onNext={() => setStep('customize')}
              onBack={() => setStep('upload')}
            />
          )}
          {step === 'customize' && (
            <CustomizeStep
              pages={pages}
              customization={customization}
              setCustomization={setCustomization}
              onGenerate={handleGenerate}
              onBack={() => setStep('reorder')}
            />
          )}
          {step === 'generating' && (
            <GenerateStep onGenerated={() => setStep('download')} />
          )}
          {step === 'download' && <DownloadStep onStartOver={handleStartOver} />}
        </div>
      </main>
      <footer className="w-full py-4">
        <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} EduSlide. All rights reserved.
            Files are processed temporarily and deleted after your session.
          </p>
        </div>
      </footer>
    </div>
  );
}

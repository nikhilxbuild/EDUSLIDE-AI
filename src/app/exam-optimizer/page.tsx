'use client';

import { useMemo, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type ExamMode = 'JEE' | 'NEET' | 'Boards';

type ProcessResult = {
  notes: string;
};

const MAX_PAGES = 30;
const REQUEST_TIMEOUT_MS = 45_000;
const TEST_API_ENDPOINT = process.env.NEXT_PUBLIC_AI_TEST_ENDPOINT;

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

function splitLines(text: string) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .flatMap((line) => (line.length ? [line] : [' ']));
}

async function extractPdfText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument(bytes).promise;

  const pagesToRead = Math.min(pdf.numPages, MAX_PAGES);
  let text = '';

  for (let i = 1; i <= pagesToRead; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();

    text += `${pageText}\n`;
  }

  return {
    text,
    pagesProcessed: pagesToRead,
    totalPages: pdf.numPages,
    truncated: pdf.numPages > MAX_PAGES,
  };
}

function getNotesFromPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') return '';
  const asObj = payload as Record<string, unknown>;

  if (typeof asObj.notes === 'string') return asObj.notes;
  if (typeof asObj.output === 'string') return asObj.output;
  if (typeof asObj.result === 'string') return asObj.result;

  return '';
}

export default function ExamOptimizerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [examMode, setExamMode] = useState<ExamMode>('JEE');
  const [lastNightMode, setLastNightMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [pagesInfo, setPagesInfo] = useState<string>('');

  const canSubmit = useMemo(() => !!selectedFile && !loading, [selectedFile, loading]);

  const handleGenerate = async () => {
    if (!selectedFile) return;

    if (!TEST_API_ENDPOINT) {
      setError('Missing NEXT_PUBLIC_AI_TEST_ENDPOINT. Add it to .env.local for testing.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setPagesInfo('');

    try {
      const { text, pagesProcessed, totalPages, truncated } = await extractPdfText(selectedFile);

      if (!text.trim()) {
        throw new Error('Could not extract readable text from this PDF.');
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(TEST_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            examMode,
            lastNightMode,
          }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiError =
          payload && typeof payload === 'object' && 'error' in payload
            ? String((payload as Record<string, unknown>).error)
            : 'Failed to generate notes from test API.';
        throw new Error(apiError);
      }

      const notes = getNotesFromPayload(payload);
      if (!notes.trim()) {
        throw new Error('Test API returned an empty result.');
      }

      setResult({ notes });
      setPagesInfo(
        `Processed ${pagesProcessed} of ${totalPages} pages${truncated ? ' (limited to first 30 pages).' : '.'}`
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong while analyzing notes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result?.notes) return;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const margin = 40;
    const lineHeight = 15;
    const pageWidth = 595;
    const pageHeight = 842;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const lines = splitLines(result.notes);
    for (const rawLine of lines) {
      const chunks: string[] = [];
      let current = '';

      for (const word of rawLine.split(' ')) {
        const next = current ? `${current} ${word}` : word;
        const width = font.widthOfTextAtSize(next, fontSize);
        if (width > pageWidth - margin * 2 && current) {
          chunks.push(current);
          current = word;
        } else {
          current = next;
        }
      }
      if (current) chunks.push(current);
      if (!chunks.length) chunks.push(' ');

      for (const line of chunks) {
        if (y < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.12, 0.12, 0.12),
        });
        y -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'smart-notes.pdf';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AI Exam Optimizer</h1>
          <p className="mt-2 text-muted-foreground">
            Temporary testing mode: PDF text is extracted on frontend and sent to your test API.
          </p>
        </div>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>1) Upload & Configure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-md border border-border bg-background/40 p-2 text-sm"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Exam Mode</p>
              <div className="grid grid-cols-3 gap-2">
                {(['JEE', 'NEET', 'Boards'] as ExamMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setExamMode(mode)}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                      examMode === mode
                        ? 'bg-gradient-to-r from-primary to-violet-500 text-primary-foreground shadow-[0_6px_16px_hsl(var(--primary)/0.25)]'
                        : 'border border-border/60 bg-background/20 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/20 p-3">
              <div>
                <Label htmlFor="last-night-mode" className="font-medium">
                  Last Night Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Aggressive summarization for quick revision.
                </p>
              </div>
              <Switch
                id="last-night-mode"
                checked={lastNightMode}
                onCheckedChange={setLastNightMode}
              />
            </div>

            <Button onClick={handleGenerate} disabled={!canSubmit} className="w-full sm:w-auto">
              {loading ? 'Analyzing your notes...' : 'Generate Smart Notes'}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>2) Smart Notes Output</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-sm text-muted-foreground">
                Your concise, exam-focused notes will appear here after processing.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border border-border/60 bg-background/30 p-4 text-sm leading-6 whitespace-pre-wrap">
                  {result.notes}
                </div>
                <p className="text-xs text-muted-foreground">{pagesInfo}</p>
                <Button onClick={handleDownloadPdf} variant="secondary">
                  Download as PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

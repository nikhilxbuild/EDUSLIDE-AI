import { NextResponse } from 'next/server';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

type ExamMode = 'JEE' | 'NEET' | 'Boards';

const MAX_PAGES = 30;
const CHUNK_SIZE = 12_000;
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

function buildPrompt(pdfText: string, examMode: ExamMode, lastNightMode: boolean) {
  return `You are an exam-focused study assistant.

Your task is to process study material and generate exam-ready notes.

Rules:
- Extract key concepts, formulas, and important topics
- Remove unnecessary explanations
- Keep only high-value exam content
- Format in structured bullet points
- Support basic handwritten/OCR text by cleaning obvious noise while preserving meaning

Exam Mode:
- JEE → focus on formulas, derivations, concepts
- NEET → focus on facts, key terms
- Boards → include definitions and step-based answers

Selected Mode: ${examMode}
${lastNightMode ? 'Last Night Mode: ON (extra concise output for quick revision)' : 'Last Night Mode: OFF'}

Output format:
- Headings
- Bullet points
- Highlight formulas clearly
- No long paragraphs

Text:
${pdfText}`;
}

function buildMergePrompt(partialNotes: string, examMode: ExamMode, lastNightMode: boolean) {
  return `You are an exam-focused study assistant.

Merge and deduplicate the following partial notes into one final output.

Rules:
- Preserve only exam-relevant points
- Remove repetition and filler
- Keep clean headings with concise bullets
- No long paragraphs
- Keep formulas and key terms explicit

Selected Mode: ${examMode}
${lastNightMode ? 'Last Night Mode: ON (ultra concise)' : 'Last Night Mode: OFF'}

Partial Notes:
${partialNotes}`;
}

function chunkText(text: string) {
  const chunks: string[] = [];
  let current = '';

  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n${paragraph}` : paragraph;
    if (next.length <= CHUNK_SIZE) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = '';
    }

    if (paragraph.length <= CHUNK_SIZE) {
      current = paragraph;
      continue;
    }

    let longChunk = '';
    for (const word of paragraph.split(/\s+/)) {
      const appended = longChunk ? `${longChunk} ${word}` : word;
      if (appended.length > CHUNK_SIZE && longChunk) {
        chunks.push(longChunk);
        longChunk = word;
      } else {
        longChunk = appended;
      }
    }

    if (longChunk) chunks.push(longChunk);
  }

  if (current) chunks.push(current);
  return chunks;
}

async function extractPdfText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());

  let pdf;
  try {
    pdf = await getDocument({ data: bytes }).promise;
  } catch {
    throw new Error('Unable to read this PDF. The file may be corrupted or unsupported.');
  }

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

async function callAnthropic(prompt: string, apiKey: string) {
  const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 1200,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    throw new Error(`AI request failed: ${errorText}`);
  }

  const data = await anthropicResponse.json();
  return (
    data?.content
      ?.filter((part: { type: string }) => part.type === 'text')
      .map((part: { text: string }) => part.text)
      .join('\n')
      .trim() || ''
  );
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request format. Please submit using multipart/form-data.' },
        { status: 400 }
      );
    }
    const file = formData.get('file');
    const examMode = formData.get('examMode');
    const lastNightMode = formData.get('lastNightMode') === 'true';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Please upload a PDF file.' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'The uploaded file is empty.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'PDF is too large. Please upload a file smaller than 15MB.' },
        { status: 400 }
      );
    }
    if (examMode !== 'JEE' && examMode !== 'NEET' && examMode !== 'Boards') {
      return NextResponse.json({ error: 'Please select a valid exam mode.' }, { status: 400 });
    }

    const { text, pagesProcessed, totalPages, truncated } = await extractPdfText(file);
    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this PDF.' },
        { status: 400 }
      );
    }

    const chunks = chunkText(text);
    const partialOutputs: string[] = [];

    for (const chunk of chunks) {
      const chunkPrompt = buildPrompt(chunk, examMode, lastNightMode);
      const chunkNotes = await callAnthropic(chunkPrompt, apiKey);
      if (chunkNotes) partialOutputs.push(chunkNotes);
    }

    if (!partialOutputs.length) {
      return NextResponse.json(
        { error: 'AI could not generate notes from this PDF content.' },
        { status: 502 }
      );
    }

    const mergePrompt = buildMergePrompt(partialOutputs.join('\n\n'), examMode, lastNightMode);
    const notes = await callAnthropic(mergePrompt, apiKey);

    if (!notes.trim()) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try another file.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      notes,
      pagesProcessed,
      totalPages,
      truncated,
      examMode,
      lastNightMode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

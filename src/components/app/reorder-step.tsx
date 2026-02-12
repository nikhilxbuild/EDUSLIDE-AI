'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

import type { Page } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ReorderStepProps {
  pages: Page[];
  setPages: Dispatch<SetStateAction<Page[]>>;
  onNext: () => void;
  onBack: () => void;
}

export function ReorderStep({
  pages,
  setPages,
  onNext,
  onBack,
}: ReorderStepProps) {
  const toggleSelectAll = (checked: boolean) => {
    setPages(pages.map((p) => ({ ...p, selected: checked })));
  };

  const togglePageSelection = (id: number) => {
    setPages(
      pages.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === pages.length - 1)
    ) {
      return;
    }
    const newPages = [...pages];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    [newPages[index], newPages[targetIndex]] = [
      newPages[targetIndex],
      newPages[index],
    ];
    setPages(newPages);
  };

  const removePage = (id: number) => {
    setPages(pages.filter((p) => p.id !== id));
  };

  const allSelected = pages.every((p) => p.selected);
  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Arrange Your Pages
          </h2>
          <p className="text-muted-foreground">
            Select, deselect, reorder, or remove pages to be included in your
            final document.
          </p>
        </div>

        <div className="my-6 flex items-center justify-between rounded-md border bg-card p-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
            />
            <Label htmlFor="select-all" className="font-medium">
              Select All
            </Label>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {selectedCount} / {pages.length} pages selected
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className="group relative flex flex-col items-center space-y-2"
            >
              <div className="relative w-full">
                <Image
                  src={page.sourceUrl}
                  alt={`Page preview ${index + 1}`}
                  width={200}
                  height={280}
                  className="rounded-md border-2 border-transparent transition-all group-hover:border-primary"
                  data-ai-hint={page.sourceHint}
                />
                <div
                  className={`absolute inset-0 rounded-md bg-black/50 transition-opacity ${
                    page.selected ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </div>

              <div className="flex w-full items-center justify-between">
                <Checkbox
                  checked={page.selected}
                  onCheckedChange={() => togglePageSelection(page.id)}
                  aria-label={`Select page ${index + 1}`}
                />
                <p className="text-xs font-medium text-muted-foreground">
                  Page {index + 1}
                </p>
              </div>

              <div className="absolute right-1 top-1 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => movePage(index, 'left')}
                  disabled={index === 0}
                  aria-label="Move page left"
                >
                  <ArrowLeft />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => movePage(index, 'right')}
                  disabled={index === pages.length - 1}
                  aria-label="Move page right"
                >
                  <ArrowRight />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removePage(page.id)}
                  aria-label="Remove page"
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft />
            Back
          </Button>
          <Button onClick={onNext} disabled={selectedCount === 0}>
            Next
            <ChevronRight />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

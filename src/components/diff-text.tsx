"use client";

import { diffWords } from 'diff';

interface DiffTextProps {
  original: string;
  modified: string;
}

export function DiffText({ original, modified }: DiffTextProps) {
  const diff = diffWords(original, modified);

  return (
    <div className="text-sm whitespace-pre-wrap">
      {diff.map((part, index) => {
        const color = part.added
          ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
          : part.removed
          ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
          : '';

        return (
          <span key={index} className={`${color}`}>
            {part.value}
          </span>
        );
      })}
    </div>
  );
}
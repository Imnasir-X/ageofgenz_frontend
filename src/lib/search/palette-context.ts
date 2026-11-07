import { createContext } from 'react';

export interface SearchPaletteApi {
  open: (initialQuery?: string) => void;
  close: () => void;
  isOpen: boolean;
}

export const SearchPaletteContext = createContext<SearchPaletteApi>({ open: () => undefined, close: () => undefined, isOpen: false });

/** True when the keyboard event comes from somewhere the reader is typing. */
export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.tagName !== 'string') return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

import { createContext, useContext } from 'react';
import type { Me, RangeParams } from './types';

export interface StudioContextValue {
  me: Me;
  range: RangeParams;
  setRange: (r: RangeParams) => void;
  signOut: () => void;
  openPalette: () => void;
}

export const StudioContext = createContext<StudioContextValue | null>(null);

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside the Studio shell');
  return ctx;
}

export const rangeLabel = (r: RangeParams) => (r.start ? `${r.start} to ${r.end}` : r.days === 1 ? 'Today' : `Last ${r.days ?? 30} days`);

import { useContext } from 'react';
import { SearchPaletteContext } from '@/lib/search/palette-context';

export const useSearchPalette = () => useContext(SearchPaletteContext);

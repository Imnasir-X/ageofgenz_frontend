import React from 'react';
import { Filter, LayoutGrid, Rows } from 'lucide-react';

type SortValue = 'latest' | 'popular' | 'trending';
type ViewMode = 'grid' | 'list';

type SortOption = {
  value: SortValue;
  label: string;
};

type Props = {
  variant: 'desktop' | 'mobile';
  filterOptions: SortOption[];
  activeSort: SortValue;
  onSortChange: (value: SortValue) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  searchHint?: string;
};

const CategoryFilterBar: React.FC<Props> = ({
  variant,
  filterOptions,
  activeSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onClearSearch,
  searchHint,
}) => {
  const sortButtonClass = (isActive: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
      isActive
        ? 'border border-orange-500 bg-orange-500 text-white shadow-md'
        : 'border border-slate-200 bg-white text-slate-900 hover:border-orange-200 hover:text-orange-700'
    }`;

  const viewButtonClass = (isActive: boolean) => {
    if (variant === 'mobile') {
      return `flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        isActive
          ? 'border-orange-300 bg-orange-50 text-orange-600'
          : 'border-slate-200 text-slate-900 hover:border-orange-200 hover:text-orange-700'
      }`;
    }

    return `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
      isActive
        ? 'border-orange-300 bg-orange-50 text-orange-600'
        : 'border-slate-200 bg-white text-slate-900 hover:border-orange-200 hover:text-orange-700'
    }`;
  };

  const searchContainerClass =
    variant === 'mobile'
      ? 'flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-200'
      : 'flex w-full max-w-xs items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-900 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-200';

  const searchWrapperClass =
    variant === 'mobile' ? 'space-y-2' : 'flex w-full max-w-xs flex-col';

  const sortButtons = (
    <>
      {filterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSortChange(option.value)}
          className={sortButtonClass(activeSort === option.value)}
        >
          {option.label}
        </button>
      ))}
    </>
  );

  const viewButtons = (
    <>
      <button
        type="button"
        onClick={() => onViewModeChange('grid')}
        className={viewButtonClass(viewMode === 'grid')}
        aria-pressed={viewMode === 'grid'}
      >
        {variant === 'desktop' && <LayoutGrid className="h-4 w-4" aria-hidden="true" />}
        Grid
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('list')}
        className={viewButtonClass(viewMode === 'list')}
        aria-pressed={viewMode === 'list'}
      >
        {variant === 'desktop' && <Rows className="h-4 w-4" aria-hidden="true" />}
        List
      </button>
    </>
  );

  const searchInput = (
    <div className={searchWrapperClass}>
      <div className={searchContainerClass}>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search articles..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-600"
          aria-label="Search articles within category"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className={`inline-flex items-center justify-center rounded-full bg-slate-100 text-base leading-none text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
              variant === 'mobile' ? 'h-7 w-7' : 'h-6 w-6'
            }`}
            aria-label="Clear search"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>
      {searchHint && <p className="text-xs text-slate-500">{searchHint}</p>}
    </div>
  );

  if (variant === 'mobile') {
    return (
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Sort</p>
          <div className="flex flex-wrap gap-2">{sortButtons}</div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">View</p>
          <div className="flex gap-2">{viewButtons}</div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Search</p>
          {searchInput}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
        <Filter className="h-4 w-4 text-orange-500" aria-hidden="true" />
        Refine Feed
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">{sortButtons}</div>
      <div className="flex items-center gap-2">{viewButtons}</div>
      {searchInput}
    </div>
  );
};

export default CategoryFilterBar;

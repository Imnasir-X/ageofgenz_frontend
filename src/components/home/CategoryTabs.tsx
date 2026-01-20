import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

type CategoryTabsProps = {
  loading: boolean;
  categories: Array<{ slug: string; name: string }>;
  usingFallbackCategories: boolean;
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  onTabKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, slug: string) => void;
  getTabId: (slug: string) => string;
  tabListId: string;
  tabPanelId: string;
  getCategoryButtonClasses: (isActive: boolean) => string;
};

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  loading,
  categories,
  usingFallbackCategories,
  activeCategory,
  onSelectCategory,
  onTabKeyDown,
  getTabId,
  tabListId,
  tabPanelId,
  getCategoryButtonClasses,
}) => (
  <section className="mb-8">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
        <h3 className="text-base font-semibold text-gray-800">Browse by Category</h3>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-700">
        <SlidersHorizontal className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
        <span>Tap a category to filter</span>
      </div>
    </div>
    {loading ? (
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <span key={`cat-skel-${i}`} className="h-10 w-24 rounded-full bg-gray-200 animate-pulse" />
        ))}
      </div>
    ) : (
      <div className="relative -mx-2 overflow-hidden rounded-full bg-orange-50/60 px-2 py-2 shadow-inner">
        <div
          id={tabListId}
          className="flex gap-2 overflow-x-auto pb-1 pl-1 pr-4 md:justify-center"
          role="tablist"
          aria-label="Article categories"
          aria-orientation="horizontal"
        >
          <button
            type="button"
            role="tab"
            id={getTabId('all')}
            aria-controls={tabPanelId}
            aria-selected={activeCategory === 'all'}
            tabIndex={activeCategory === 'all' ? 0 : -1}
            onClick={() => onSelectCategory('all')}
            onKeyDown={(event) => onTabKeyDown(event, 'all')}
            className={getCategoryButtonClasses(activeCategory === 'all')}
          >
            All
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const tabId = getTabId(cat.slug);
            return (
              <button
                key={cat.slug}
                type="button"
                role="tab"
                id={tabId}
                aria-controls={tabPanelId}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelectCategory(cat.slug)}
                onKeyDown={(event) => onTabKeyDown(event, cat.slug)}
                className={getCategoryButtonClasses(isActive)}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
        {usingFallbackCategories && (
          <span className="sr-only" role="status">
            Showing cached categories due to a temporary network issue.
          </span>
        )}
      </div>
    )}
  </section>
);

export default CategoryTabs;

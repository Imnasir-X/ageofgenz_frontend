import React, { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

// Mock search suggestions - in real app, fetch from backend API
const mockSearchSuggestions = (query: string): string[] => {
  const suggestions = [
    'AI Technology Revolution',
    'AI and Future Jobs',
    'AI Ethics Debate',
    'Gen Z Culture Trends', 
    'Gen Z and Social Media',
    'Generation Z Activism',
    'Climate Change Solutions',
    'Climate Change Impact',
    'Climate Action Now',
    'Mental Health Awareness',
    'Mental Health in Schools',
    'Mental Health Support',
    'Social Media Algorithms',
    'Social Media Privacy',
    'Social Media Trends 2025',
    'Politics and Young Voters',
    'Political Movements',
    'Election Coverage',
    'Tech Industry News',
    'Technology Innovation',
    'Sustainable Technology'
  ];
  
  if (!query) return [];
  
  return suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);
};

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search articles, topics, or keywords...",
  showSuggestions = true
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Sample trending searches - in real app, fetch from backend
  const trendingSearches = [
    'AI Technology',
    'Gen Z Culture',
    'Climate Change',
    'Mental Health',
    'Social Media Trends'
  ];

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5)); // Keep only last 5
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsFocused(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get all dropdown items for keyboard navigation
  const getDropdownItems = () => {
    const items: string[] = [];
    if (query) {
      items.push(...searchSuggestions);
    }
    if (!query && recentSearches.length > 0) {
      items.push(...recentSearches);
    }
    if (!query || searchSuggestions.length === 0) {
      items.push(...trendingSearches);
    }
    return items;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = getDropdownItems();
    
    if (!showDropdown) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          handleSearchSelect(items[highlightedIndex]);
        } else if (query.trim()) {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      if (onSearch) {
        onSearch(query.trim());
      } else {
        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchSuggestions([]);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSearchSelect = (searchTerm: string) => {
    setQuery(searchTerm);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    saveRecentSearch(searchTerm);
    
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions) {
      setShowDropdown(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);
    
    // Get search suggestions when user types
    if (value.trim()) {
      const suggestions = mockSearchSuggestions(value);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
    
    if (showSuggestions) {
      setShowDropdown(true);
    }
  };

  // Highlight matching text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="font-semibold text-orange-600">{part}</span>
      ) : (
        part
      )
    );
  };

  const dropdownItems = getDropdownItems();

  return (
    <div ref={searchRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div 
          className={`relative flex items-center bg-white rounded-full shadow-sm border-2 transition-all duration-300 ${
            isFocused ? 'border-orange-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Search 
            className={`absolute left-4 transition-colors duration-300 ${
              isFocused ? 'text-orange-500' : 'text-gray-400'
            }`} 
            size={18} 
          />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full py-3 pl-11 pr-20 text-sm text-gray-700 bg-transparent rounded-full focus:outline-none placeholder-gray-400"
            autoComplete="off"
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-14 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          
          <button
            type="submit"
            className={`absolute right-1.5 px-4 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-all duration-200 ${
              query ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
            }`}
            disabled={!query}
          >
            Search
          </button>
        </div>
      </form>

      {/* Enhanced Dropdown with Suggestions, Recent, and Trending */}
      {showSuggestions && showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-3 animate-fadeIn">
          
          {/* Search Suggestions */}
          {query && searchSuggestions.length > 0 && (
            <div className="mb-2">
              <div className="px-4 pb-2 flex items-center text-xs text-gray-500">
                <Search size={14} className="mr-1" />
                <span className="font-medium">Suggestions</span>
              </div>
              {searchSuggestions.map((suggestion, index) => {
                const globalIndex = index;
                return (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handleSearchSelect(suggestion)}
                    className={`w-full px-4 py-2 text-sm text-left transition-colors flex items-center ${
                      highlightedIndex === globalIndex 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <ArrowUpRight size={14} className="mr-2 flex-shrink-0" />
                    <span>{highlightMatch(suggestion, query)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="mb-2">
              <div className="px-4 pb-2 flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={14} className="mr-1" />
                  <span className="font-medium">Recent Searches</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((recent, index) => {
                const globalIndex = query ? searchSuggestions.length + index : index;
                return (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleSearchSelect(recent)}
                    className={`w-full px-4 py-2 text-sm text-left transition-colors flex items-center ${
                      highlightedIndex === globalIndex 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <Clock size={14} className="mr-2 flex-shrink-0 text-gray-400" />
                    <span>{recent}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Trending Searches */}
          {(!query || searchSuggestions.length === 0) && (
            <div>
              <div className="px-4 pb-2 flex items-center text-xs text-gray-500">
                <TrendingUp size={14} className="mr-1" />
                <span className="font-medium">Trending Searches</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {trendingSearches.map((trend, index) => {
                  const globalIndex = (!query && recentSearches.length > 0) 
                    ? recentSearches.length + index 
                    : query ? searchSuggestions.length + index : index;
                  return (
                    <button
                      key={`trending-${index}`}
                      onClick={() => handleSearchSelect(trend)}
                      className={`w-full px-4 py-2 text-sm text-left transition-colors flex items-center ${
                        highlightedIndex === globalIndex 
                          ? 'bg-orange-50 text-orange-600' 
                          : 'hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      <TrendingUp size={14} className="mr-2 flex-shrink-0 text-gray-400" />
                      <span>{trend}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp, Clock, ArrowUpRight, Sparkles, Brain } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

// Enhanced AI-like search suggestions
const getIntelligentSuggestions = (query: string): string[] => {
  const suggestions = [
    'AI Technology Revolution and its impact on society',
    'How AI will transform future job markets',
    'The ethical implications of AI development',
    'Gen Z cultural trends shaping the future', 
    'Social media influence on Generation Z behavior',
    'Climate change solutions for the next decade',
    'Mental health awareness in digital age',
    'The psychology behind social media addiction',
    'Political movements driven by young voters',
    'Sustainable technology innovations 2025',
    'The future of work in an AI-driven world',
    'How to build resilience in uncertain times',
    'The rise of remote work culture',
    'Cryptocurrency and the future of finance',
    'Space exploration breakthroughs',
    'Renewable energy transformation',
    'The metaverse and virtual reality future',
    'Biotechnology advances in healthcare',
    'The evolution of educational technology',
    'Cybersecurity in the digital age'
  ];
  
  if (!query) return [];
  
  // More intelligent matching
  const queryLower = query.toLowerCase();
  const scored = suggestions.map(suggestion => {
    const suggestionLower = suggestion.toLowerCase();
    let score = 0;
    
    // Exact word matches get higher score
    queryLower.split(' ').forEach(word => {
      if (suggestionLower.includes(word)) {
        score += word.length;
      }
    });
    
    // Boost score for suggestions that start with the query
    if (suggestionLower.startsWith(queryLower)) {
      score += 20;
    }
    
    return { suggestion, score };
  });
  
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.suggestion);
};

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Ask me anything...",
  showSuggestions = true
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Enhanced trending searches with more engaging topics
  const trendingSearches = [
    'What will AI look like in 10 years?',
    'How to build meaningful relationships in 2025',
    'The future of sustainable living',
    'Why Gen Z is changing the workplace',
    'The psychology of social media influence'
  ];

  // Load recent searches - using simple state management instead of localStorage
  useEffect(() => {
    // In a real app, you'd load from localStorage or API
    // For demo purposes, we'll use empty array
    setRecentSearches([]);
  }, []);

  // Save recent searches
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    // In real app: localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    // In real app: localStorage.removeItem('recentSearches');
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

  // Enhanced keyboard navigation
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
          handleSubmit();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSubmit = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      if (onSearch) {
        onSearch(query.trim());
      }
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchSuggestions([]);
    setHighlightedIndex(-1);
    setIsThinking(false);
    inputRef.current?.focus();
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSearchSelect = (searchTerm: string) => {
    setQuery(searchTerm);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    setIsThinking(false);
    saveRecentSearch(searchTerm);
    
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions) {
      setShowDropdown(true);
    }
  };

  // Enhanced input change with "thinking" simulation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);
    
    // Clear previous timer
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    
    if (value.trim()) {
      setIsThinking(true);
      
      // Simulate AI thinking time
      const timer = setTimeout(() => {
        const suggestions = getIntelligentSuggestions(value);
        setSearchSuggestions(suggestions);
        setIsThinking(false);
      }, 300); // 300ms delay for more natural feel
      
      setTypingTimer(timer);
    } else {
      setSearchSuggestions([]);
      setIsThinking(false);
    }
    
    if (showSuggestions) {
      setShowDropdown(true);
    }
  };

  // Enhanced highlight function
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
      <div 
        className={`relative flex items-center bg-white rounded-full shadow-sm border-2 transition-all duration-300 ${
          isFocused ? 'border-orange-500 shadow-lg ring-4 ring-orange-100' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <div className="absolute left-4 flex items-center">
          {isThinking ? (
            <div className="flex items-center space-x-1">
              <Brain className="text-orange-500 animate-pulse" size={18} />
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          ) : (
            <Search 
              className={`transition-all duration-300 ${
                isFocused ? 'text-orange-500 scale-110' : 'text-gray-400'
              }`} 
              size={18} 
            />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full py-3 pl-16 pr-24 text-sm text-gray-700 bg-transparent rounded-full focus:outline-none placeholder-gray-400 transition-all duration-300"
          autoComplete="off"
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-16 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X size={16} />
          </button>
        )}
        
        <button
          type="button"
          onClick={handleSubmit}
          className={`absolute right-1.5 px-4 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-300 transform ${
            query ? 'bg-orange-500 hover:bg-orange-600 scale-100 shadow-md hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed scale-95'
          }`}
          disabled={!query}
        >
          <div className="flex items-center space-x-1">
            <span>Search</span>
            <Sparkles size={14} className={query ? 'animate-pulse' : ''} />
          </div>
        </button>
      </div>

      {/* Enhanced Dropdown */}
      {showSuggestions && showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-3 animate-fadeIn">
          
          {/* Thinking State */}
          {isThinking && query && (
            <div className="px-4 py-4 flex items-center space-x-3 text-sm text-gray-500">
              <Brain className="animate-pulse text-orange-500" size={16} />
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}

          {/* Enhanced Search Suggestions */}
          {query && searchSuggestions.length > 0 && !isThinking && (
            <div className="mb-2">
              <div className="px-4 pb-2 flex items-center text-xs text-gray-500">
                <Sparkles size={14} className="mr-1 text-orange-500" />
                <span className="font-medium">AI Suggestions</span>
              </div>
              {searchSuggestions.map((suggestion, index) => {
                const globalIndex = index;
                return (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handleSearchSelect(suggestion)}
                    className={`w-full px-4 py-2 text-sm text-left transition-all duration-200 flex items-center group ${
                      highlightedIndex === globalIndex 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <ArrowUpRight size={14} className="mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="leading-relaxed">{highlightMatch(suggestion, query)}</span>
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
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 hover:bg-gray-100 rounded transition-all"
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
                    className={`w-full px-4 py-2 text-sm text-left transition-all duration-200 flex items-center group ${
                      highlightedIndex === globalIndex 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <Clock size={14} className="mr-2 flex-shrink-0 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    <span>{recent}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Enhanced Trending Searches */}
          {(!query || searchSuggestions.length === 0) && !isThinking && (
            <div>
              <div className="px-4 pb-2 flex items-center text-xs text-gray-500">
                <TrendingUp size={14} className="mr-1" />
                <span className="font-medium">Trending Questions</span>
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
                      className={`w-full px-4 py-2 text-sm text-left transition-all duration-200 flex items-center group ${
                        highlightedIndex === globalIndex 
                          ? 'bg-orange-50 text-orange-600' 
                          : 'hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      <TrendingUp size={14} className="mr-2 flex-shrink-0 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      <span className="leading-relaxed">{trend}</span>
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
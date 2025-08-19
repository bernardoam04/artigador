'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchWithSuggestionsProps {
  placeholder?: string;
  className?: string;
  iconClassName?: string;
  onSearch?: (query: string) => void;
  showButton?: boolean;
  buttonText?: string;
  initialValue?: string;
}

interface Suggestion {
  type: 'article' | 'author' | 'keyword' | 'event';
  value: string;
  id?: string;
  authors?: string[];
  event?: string;
  shortName?: string;
  count?: number;
}

export default function SearchWithSuggestions({
  placeholder = "Search articles, authors, keywords...",
  className = "",
  iconClassName = "text-gray-400",
  onSearch,
  showButton = false,
  buttonText = "Search",
  initialValue = ""
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update query when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const generateSuggestions = useCallback(async (searchQuery: string): Promise<Suggestion[]> => {
    if (searchQuery.length < 2) return [];

    try {
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        return data.suggestions || [];
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
    
    return [];
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query) {
        const newSuggestions = await generateSuggestions(query);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setSelectedIndex(-1);
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce API calls
    return () => clearTimeout(timeoutId);
  }, [query, generateSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'article' && suggestion.id) {
      // Navigate to article
      window.location.href = `/article/${suggestion.id}`;
    } else {
      // Set query and trigger search
      setQuery(suggestion.value);
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(suggestion.value);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (onSearch) {
          onSearch(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'article':
        return '📄';
      case 'author':
        return '👤';
      case 'keyword':
        return '🏷️';
      case 'event':
        return '🎯';
      default:
        return '🔍';
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${iconClassName}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          className={className}
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {showButton && (
          <button
            type="submit"
            className="absolute right-2 top-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {buttonText}
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center flex-1 min-w-0">
                <span className="mr-3 text-lg">{getSuggestionIcon(suggestion.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.value}
                    {suggestion.type === 'event' && suggestion.shortName && (
                      <span className="text-gray-500"> ({suggestion.shortName})</span>
                    )}
                  </div>
                  {suggestion.type === 'article' && suggestion.authors && (
                    <div className="text-xs text-gray-500 truncate">
                      by {suggestion.authors.join(', ')}
                    </div>
                  )}
                  {suggestion.type === 'article' && suggestion.event && (
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.event}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 capitalize">
                    {suggestion.type}
                    {suggestion.count && suggestion.type !== 'event' && ` (${suggestion.count} articles)`}
                    {suggestion.count && suggestion.type === 'event' && ` (${suggestion.count} editions)`}
                  </div>
                </div>
              </div>
              {suggestion.type === 'article' && (
                <div className="text-xs text-blue-600 ml-2">View →</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ClockIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

interface SearchFilters {
  query: string;
  category?: string;
  priceRange?: [number, number];
  location?: string;
  sortBy?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'recent' | 'trending';
  count?: number;
}

export default function SearchBar({
  onSearch,
  onFilterChange,
  placeholder = "Search for products, categories, or vendors...",
  showFilters = true,
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    priceRange: [0, 1000000],
    location: '',
    sortBy: 'relevance'
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock suggestions (in real app, these would come from API)
  const suggestions: SearchSuggestion[] = [
    { id: '1', text: 'Traditional Hausa wear', type: 'trending', count: 342 },
    { id: '2', text: 'Kano textiles', type: 'trending', count: 156 },
    { id: '3', text: 'Handcrafted jewelry', type: 'category', count: 89 },
    { id: '4', text: 'Northern crafts', type: 'recent' },
    { id: '5', text: 'Fulani accessories', type: 'product', count: 23 },
    { id: '6', text: 'Arewa fashion', type: 'trending', count: 78 },
    { id: '7', text: 'Traditional medicine', type: 'category', count: 45 },
    { id: '8', text: 'Agricultural products', type: 'recent' }
  ];

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(query.toLowerCase())
  );

  const categories = [
    'All Categories',
    'Traditional Textiles',
    'Handcrafted Jewelry',
    'Agricultural Products',
    'Arts & Crafts',
    'Modern Fashion',
    'Electronics',
    'Home & Decor'
  ];

  const locations = [
    'All Locations',
    'Kano',
    'Kaduna',
    'Zaria',
    'Sokoto',
    'Maiduguri',
    'Gombe',
    'Bauchi'
  ];

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    const newFilters = { ...filters, query: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
    setShowSuggestions(value.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleInputChange(suggestion.text);
    onSearch?.(suggestion.text);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    handleInputChange('');
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
      case 'trending':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-orange-500" />;
      case 'category':
        return <span className="text-sm">📂</span>;
      case 'product':
      default:
        return <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <div className={`flex items-center bg-white rounded-lg border-2 transition-all duration-200 ${
            isFocused 
              ? 'border-kasuwa-primary-500 shadow-lg' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-4" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(query.length > 0);
              }}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 lg:py-4 text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="m-1 px-6 py-2 lg:py-3 bg-kasuwa-primary-600 text-white font-semibold rounded-md hover:bg-kasuwa-primary-700 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (query.length > 0 || isFocused) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
              {query.length > 0 && filteredSuggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Suggestions
                  </div>
                  {filteredSuggestions.slice(0, 6).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        {getSuggestionIcon(suggestion.type)}
                        <span className="text-gray-900">{suggestion.text}</span>
                        {suggestion.type === 'trending' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                            Trending
                          </span>
                        )}
                      </div>
                      {suggestion.count && (
                        <span className="text-sm text-gray-500">
                          {suggestion.count} results
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : query.length === 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Popular Searches
                  </div>
                  {suggestions.filter(s => s.type === 'trending').slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        {getSuggestionIcon(suggestion.type)}
                        <span className="text-gray-900">{suggestion.text}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {suggestion.count} results
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No suggestions found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category === 'All Categories' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
            >
              {locations.map((location) => (
                <option key={location} value={location === 'All Locations' ? '' : location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Price:</span>
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={filters.priceRange?.[1] || 1000000}
                onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                className="flex-1 accent-kasuwa-primary-600"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap">
                ₦{((filters.priceRange?.[1] || 1000000) / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { audiobookApi } from '../services/api';
import AudiobookCard from '../components/AudiobookCard';
import { Search, Filter } from 'lucide-react';

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => audiobookApi.getCategories(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['audiobooks', 'browse', searchQuery, selectedCategory, page],
    queryFn: () => {
      if (searchQuery) {
        return audiobookApi.search(searchQuery, page, 20);
      }
      if (selectedCategory) {
        return audiobookApi.getByCategory(selectedCategory, page, 20);
      }
      return audiobookApi.getAll(page, 20);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Browse Audiobooks</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or description..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Categories</option>
            {categories?.map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {data?.content?.map((audiobook: any) => (
              <AudiobookCard key={audiobook.id} audiobook={audiobook} />
            ))}
          </div>
          
          {/* Pagination */}
          {data && !data.last && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">Page {page + 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={data.last}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

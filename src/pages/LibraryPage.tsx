import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { libraryApi } from '../services/api';
import AudiobookCard from '../components/AudiobookCard';
import { Library, Heart } from 'lucide-react';

export default function LibraryPage() {
  const { data: library, isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: () => libraryApi.getLibrary(),
  });

  const { data: favorites } = useQuery({
    queryKey: ['library', 'favorites'],
    queryFn: () => libraryApi.getFavorites(),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">Loading your library...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Library</h1>

      {/* Favorites Section */}
      {favorites && favorites.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            <h2 className="text-2xl font-bold text-gray-900">Favorites</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {favorites.map((item) => (
              <Link key={item.id} to={`/audiobook/${item.audiobook.id}`}>
                <AudiobookCard audiobook={item.audiobook} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Library Items */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <Library className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">All Items</h2>
        </div>
        {library && library.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {library.map((item) => (
              <Link key={item.id} to={`/audiobook/${item.audiobook.id}`}>
                <AudiobookCard audiobook={item.audiobook} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Library className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Your library is empty</p>
            <Link to="/browse" className="text-orange-600 hover:underline mt-2 inline-block">
              Browse audiobooks
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

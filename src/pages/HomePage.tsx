import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { audiobookApi } from '../services/api';
import AudiobookCard from '../components/AudiobookCard';
import { Play, BookOpen } from 'lucide-react';

export default function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ['audiobooks', 'featured'],
    queryFn: () => audiobookApi.getFeatured(0, 10),
  });

  const { data: newReleases } = useQuery({
    queryKey: ['audiobooks', 'new-releases'],
    queryFn: () => audiobookApi.getNewReleases(0, 10),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-12 mb-12 text-white">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-4">Listen to Great Books</h1>
          <p className="text-xl mb-8">Discover thousands of audiobooks from your favorite authors</p>
          <Link
            to="/browse"
            className="inline-flex items-center space-x-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <Play className="w-5 h-5" />
            <span>Browse Audiobooks</span>
          </Link>
        </div>
      </div>

      {/* Featured Audiobooks */}
      <section className="mb-12">
        <div className="flex items-center space-x-2 mb-6">
          <BookOpen className="w-6 h-6 text-orange-600" />
          <h2 className="text-3xl font-bold text-gray-900">Featured Audiobooks</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {featured?.content?.map((audiobook: any) => (
            <AudiobookCard key={audiobook.id} audiobook={audiobook} />
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">New Releases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {newReleases?.content?.map((audiobook: any) => (
            <AudiobookCard key={audiobook.id} audiobook={audiobook} />
          ))}
        </div>
      </section>
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { audiobookApi, libraryApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Play, Plus, Heart, Star } from 'lucide-react';

export default function AudiobookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: audiobook, isLoading } = useQuery({
    queryKey: ['audiobook', id],
    queryFn: () => audiobookApi.getById(id!),
    enabled: !!id,
  });

  const addToLibraryMutation = useMutation({
    mutationFn: (audiobookId: string) => libraryApi.addToLibrary(audiobookId),
    onSuccess: () => {
      toast.success('Added to library!');
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
    onError: () => {
      toast.error('Failed to add to library');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!audiobook) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">Audiobook not found</div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cover Image */}
          <div>
            {audiobook.coverImageUrl ? (
              <img
                src={audiobook.coverImageUrl}
                alt={audiobook.title}
                className="w-full rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                <Play className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{audiobook.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {audiobook.author}</p>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-1 font-semibold">{audiobook.rating.toFixed(1)}</span>
                <span className="ml-1 text-gray-500">({audiobook.reviewCount} reviews)</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{formatDuration(audiobook.durationMinutes)}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{audiobook.category}</span>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">About this audiobook</h3>
              <p className="text-gray-700 leading-relaxed">{audiobook.description || 'No description available.'}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Narrated by</p>
              <p className="font-semibold">{audiobook.narrator}</p>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">${audiobook.price.toFixed(2)}</span>
            </div>

            <div className="flex space-x-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => addToLibraryMutation.mutate(audiobook.id)}
                    disabled={addToLibraryMutation.isPending}
                    className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add to Library</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
                >
                  <Play className="w-5 h-5" />
                  <span>Sign in to Purchase</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Video Streaming Page
 * 
 * Netflix-like video streaming interface with:
 * - Video library/grid
 * - Video player
 * - Upload functionality
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import HLSVideoPlayer from '../components/HLSVideoPlayer';

const API_BASE_URL = 'http://localhost:8000/api';

interface Video {
  id: string;
  title: string;
  filename: string;
  master_playlist_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  status: string;
  is_ready: boolean;
  created_at: string;
}

const VideoStreamingPage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const queryClient = useQueryClient();

  // Fetch videos
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/videos/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.data.results || response.data;
    },
  });

  // Upload video mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post(`${API_BASE_URL}/videos/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Token ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Video uploaded! Processing...');
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowUpload(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Upload failed');
    },
  });

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    uploadMutation.mutate(formData);
  };

  const readyVideos = videos.filter((v) => v.is_ready);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Video Streaming</h1>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            {showUpload ? 'Cancel' : 'Upload Video'}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Upload Form */}
        {showUpload && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block mb-2">Video File</label>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  required
                  className="w-full text-white"
                />
              </div>
              <div>
                <label className="block mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  className="w-full px-4 py-2 bg-gray-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  className="w-full px-4 py-2 bg-gray-700 rounded text-white"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={uploadMutation.isPending}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </button>
            </form>
          </div>
        )}

        {/* Video Player */}
        {selectedVideo && (
          <div className="mb-8">
            <div className="mb-4">
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white mb-2"
              >
                ← Back to Library
              </button>
              <h2 className="text-2xl font-bold">{selectedVideo.title || selectedVideo.filename}</h2>
            </div>
            <div className="bg-black rounded-lg overflow-hidden">
              <HLSVideoPlayer
                masterPlaylistUrl={selectedVideo.master_playlist_url}
                title={selectedVideo.title || selectedVideo.filename}
                thumbnailUrl={selectedVideo.thumbnail_url}
              />
            </div>
          </div>
        )}

        {/* Video Library */}
        {!selectedVideo && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Videos</h2>
            
            {isLoading ? (
              <div className="text-center py-12">Loading videos...</div>
            ) : readyVideos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No videos available. Upload a video to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {readyVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  >
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title || video.filename}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold truncate">
                        {video.title || video.filename}
                      </h3>
                      {video.duration_seconds && (
                        <p className="text-sm text-gray-400 mt-1">
                          {Math.floor(video.duration_seconds / 60)}:
                          {Math.floor(video.duration_seconds % 60)
                            .toString()
                            .padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Processing Videos */}
            {videos.filter((v) => !v.is_ready).length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Processing Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos
                    .filter((v) => !v.is_ready)
                    .map((video) => (
                      <div
                        key={video.id}
                        className="bg-gray-800 rounded-lg overflow-hidden opacity-60"
                      >
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-sm">Processing...</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold truncate">
                            {video.title || video.filename}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            Status: {video.status}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStreamingPage;

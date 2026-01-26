import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { creatorToolsApi } from '../services/api';
import { Upload, CheckCircle, XCircle, DollarSign, BookOpen, FileAudio, TrendingUp } from 'lucide-react';

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  status: string;
  duration_seconds: number;
  loudness_lufs: number | null;
  quality_check_passed: boolean;
  quality_check_notes: string;
}

interface Audiobook {
  id: string;
  title: string;
  description: string;
  status: string;
  chapters: Chapter[];
  chapters_count: number;
  total_duration_seconds: number;
  price: string;
}

export default function CreatorToolsPage() {
  const [activeTab, setActiveTab] = useState<'audiobooks' | 'upload' | 'revenue'>('audiobooks');
  const [selectedAudiobook, setSelectedAudiobook] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    chapter_number: 1,
    title: '',
    audio_file: null as File | null,
  });

  const queryClient = useQueryClient();

  // Fetch audiobooks
  const { data: audiobooks = [], isLoading } = useQuery({
    queryKey: ['creator-audiobooks'],
    queryFn: () => creatorToolsApi.getAudiobooks(),
  });

  // Fetch revenue dashboard
  const { data: revenueData } = useQuery({
    queryKey: ['revenue-dashboard'],
    queryFn: () => creatorToolsApi.getRevenueDashboard(),
    enabled: activeTab === 'revenue',
  });

  // Upload chapter mutation
  const uploadChapterMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!selectedAudiobook) throw new Error('No audiobook selected');
      return creatorToolsApi.uploadChapter(selectedAudiobook, formData);
    },
    onSuccess: () => {
      toast.success('Chapter uploaded and processing started!');
      queryClient.invalidateQueries({ queryKey: ['creator-audiobooks'] });
      setUploadForm({ chapter_number: 1, title: '', audio_file: null });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to upload chapter');
    },
  });

  // Publish audiobook mutation
  const publishMutation = useMutation({
    mutationFn: (audiobookId: string) => creatorToolsApi.publishAudiobook(audiobookId),
    onSuccess: () => {
      toast.success('Audiobook published successfully!');
      queryClient.invalidateQueries({ queryKey: ['creator-audiobooks'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to publish audiobook');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm({ ...uploadForm, audio_file: e.target.files[0] });
    }
  };

  const handleUpload = () => {
    if (!selectedAudiobook) {
      toast.error('Please select an audiobook first');
      return;
    }
    if (!uploadForm.audio_file) {
      toast.error('Please select an audio file');
      return;
    }

    const formData = new FormData();
    formData.append('chapter_number', uploadForm.chapter_number.toString());
    formData.append('title', uploadForm.title);
    formData.append('audio_file', uploadForm.audio_file);

    uploadChapterMutation.mutate(formData);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      approved: 'bg-green-100 text-green-800',
      quality_check: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Creator Tools</h1>
        <p className="mt-2 text-gray-600">Manage your audiobooks, upload chapters, and track revenue</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('audiobooks')}
            className={`${
              activeTab === 'audiobooks'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <BookOpen className="w-5 h-5" />
            <span>My Audiobooks</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`${
              activeTab === 'upload'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Chapter</span>
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`${
              activeTab === 'revenue'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Revenue Dashboard</span>
          </button>
        </nav>
      </div>

      {/* Audiobooks Tab */}
      {activeTab === 'audiobooks' && (
        <div>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : audiobooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audiobooks</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first audiobook.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audiobooks.map((audiobook: Audiobook) => (
                <div key={audiobook.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{audiobook.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{audiobook.description}</p>
                      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audiobook.status)}`}>
                          {audiobook.status}
                        </span>
                        <span>{audiobook.chapters_count} chapters</span>
                        <span>{formatDuration(audiobook.total_duration_seconds)}</span>
                        <span>${audiobook.price}</span>
                      </div>
                    </div>
                    {audiobook.status !== 'published' && (
                      <button
                        onClick={() => publishMutation.mutate(audiobook.id)}
                        disabled={publishMutation.isPending}
                        className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                      >
                        {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                      </button>
                    )}
                  </div>

                  {/* Chapters */}
                  {audiobook.chapters && audiobook.chapters.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Chapters</h4>
                      <div className="space-y-2">
                        {audiobook.chapters.map((chapter: Chapter) => (
                          <div key={chapter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm font-medium text-gray-900">
                                Chapter {chapter.chapter_number}: {chapter.title}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(chapter.status)}`}>
                                {chapter.status}
                              </span>
                              {chapter.loudness_lufs !== null && (
                                <span className="text-xs text-gray-500">
                                  Loudness: {chapter.loudness_lufs.toFixed(2)} LUFS
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {chapter.quality_check_passed ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              {chapter.quality_check_notes && (
                                <span className="text-xs text-gray-500">{chapter.quality_check_notes}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Audio Chapter</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Audiobook
              </label>
              <select
                value={selectedAudiobook || ''}
                onChange={(e) => setSelectedAudiobook(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Select an audiobook --</option>
                {audiobooks.map((audiobook: Audiobook) => (
                  <option key={audiobook.id} value={audiobook.id}>
                    {audiobook.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Number
              </label>
              <input
                type="number"
                min="1"
                value={uploadForm.chapter_number}
                onChange={(e) => setUploadForm({ ...uploadForm, chapter_number: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="e.g., Chapter 1: The Beginning"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-orange-400 transition-colors">
                <div className="space-y-1 text-center">
                  <FileAudio className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  {uploadForm.audio_file && (
                    <p className="text-xs text-gray-500 mt-2">{uploadForm.audio_file.name}</p>
                  )}
                  <p className="text-xs text-gray-500">MP3, WAV, M4A up to 100MB</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Automatic Processing</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Loudness normalization to -23 LUFS</li>
                <li>✓ Quality checks (sample rate, bit depth, true peak)</li>
                <li>✓ Audio analysis and metrics</li>
              </ul>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploadChapterMutation.isPending || !selectedAudiobook || !uploadForm.audio_file}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploadChapterMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading and Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Chapter</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div>
          {revenueData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        ${revenueData.summary?.total_revenue?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Your Share</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        ${revenueData.summary?.total_creator_share?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Sales</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {revenueData.summary?.total_sales || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-gray-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Platform Share</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        ${revenueData.summary?.platform_share?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue by Audiobook */}
              {revenueData.by_audiobook && revenueData.by_audiobook.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Audiobook</h3>
                  <div className="space-y-3">
                    {revenueData.by_audiobook.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium text-gray-900">{item.audiobook__title}</span>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${item.revenue?.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{item.sales} sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revenue by Period */}
              {revenueData.by_period && revenueData.by_period.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Timeline</h3>
                  <div className="space-y-3">
                    {revenueData.by_period.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">
                          {new Date(item.period_start).toLocaleDateString()}
                        </span>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${item.revenue?.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{item.sales} sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No revenue data</h3>
              <p className="mt-1 text-sm text-gray-500">Revenue will appear here once your audiobooks are published and sold.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

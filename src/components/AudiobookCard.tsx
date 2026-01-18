import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { Audiobook } from '../types';

interface AudiobookCardProps {
  audiobook: Audiobook;
}

export default function AudiobookCard({ audiobook }: AudiobookCardProps) {
  return (
    <Link to={`/audiobook/${audiobook.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {audiobook.coverImageUrl ? (
          <img
            src={audiobook.coverImageUrl}
            alt={audiobook.title}
            className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-gray-200 flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600">
            {audiobook.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{audiobook.author}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-700 ml-1">{audiobook.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm font-semibold text-orange-600">${audiobook.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

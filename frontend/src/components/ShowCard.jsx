import { Link } from 'react-router-dom';
import { FiPlay, FiInfo } from 'react-icons/fi';

const ShowCard = ({ show }) => {
  const getTypeColor = (type) => {
    return type === 'Movie' ? 'bg-blue-600' : 'bg-green-600';
  };

  const getRatingColor = (rating) => {
    if (!rating) return 'bg-gray-600';
    if (['R', 'NC-17', 'TV-MA'].includes(rating)) return 'bg-red-600';
    if (['PG-13', 'TV-14'].includes(rating)) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <Link to={`/show/${show.id}`} className="block">
      <div className="show-card bg-netflix-dark rounded-lg overflow-hidden shadow-lg cursor-pointer group">
        {/* Placeholder Image */}
        <div className="relative h-48 bg-gradient-to-br from-netflix-red/20 to-netflix-dark flex items-center justify-center">
          <span className="text-4xl font-bold text-white/20">
            {show.title?.charAt(0) || 'F'}
          </span>
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
            <button className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors">
              <FiPlay className="w-5 h-5" />
            </button>
            <button className="bg-gray-700 text-white p-3 rounded-full hover:bg-gray-600 transition-colors">
              <FiInfo className="w-5 h-5" />
            </button>
          </div>

          {/* Type Badge */}
          <span className={`absolute top-2 left-2 ${getTypeColor(show.type)} text-white text-xs px-2 py-1 rounded`}>
            {show.type}
          </span>

          {/* Rating Badge */}
          {show.rating && (
            <span className={`absolute top-2 right-2 ${getRatingColor(show.rating)} text-white text-xs px-2 py-1 rounded`}>
              {show.rating}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg truncate group-hover:text-netflix-red transition-colors">
            {show.title}
          </h3>
          
          <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
            <span>{show.release_year || 'N/A'}</span>
            <span>{show.duration || 'N/A'}</span>
          </div>

          {show.listed_in && (
            <p className="text-gray-500 text-xs mt-2 truncate">
              {show.listed_in}
            </p>
          )}

          <p className="text-gray-400 text-sm mt-3 line-clamp-2">
            {show.description || 'No description available.'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ShowCard;

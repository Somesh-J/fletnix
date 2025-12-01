import { FiFilter, FiX, FiShield } from 'react-icons/fi';

const Filters = ({ 
  selectedType, 
  setSelectedType, 
  selectedGenre, 
  setSelectedGenre, 
  genres,
  kidsMode,
  setKidsMode,
  onClearFilters 
}) => {
  const types = ['All', 'Movie', 'TV Show'];

  const hasFilters = selectedType !== 'All' || selectedGenre || kidsMode;

  return (
    <div className="bg-netflix-dark/50 backdrop-blur-sm rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Icon */}
        <div className="flex items-center space-x-2 text-gray-400">
          <FiFilter className="w-5 h-5" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-400 text-sm">Type:</label>
          <div className="flex rounded-lg overflow-hidden">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 text-sm transition-colors ${
                  selectedType === type
                    ? 'bg-netflix-red text-white'
                    : 'bg-netflix-dark text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-400 text-sm">Genre:</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-netflix-dark text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-netflix-red focus:outline-none"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Kids Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setKidsMode(!kidsMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              kidsMode
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                : 'bg-netflix-dark text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <FiShield className={`w-4 h-4 ${kidsMode ? 'text-white' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">Kids</span>
          </button>
          {kidsMode && (
            <span className="text-xs text-green-400">No R-rated content</span>
          )}
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-netflix-red hover:text-red-400 transition-colors"
          >
            <FiX className="w-4 h-4" />
            <span className="text-sm">Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Filters;

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiFilm, FiStar, FiSearch } from 'react-icons/fi';
import ShowCard from '../components/ShowCard';
import Pagination from '../components/Pagination';
import Filters from '../components/Filters';
import LoadingSpinner from '../components/LoadingSpinner';
import Recommendations from '../components/Recommendations';
import { showService } from '../services/showService';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [genres, setGenres] = useState([]);
  
  const [recommendations, setRecommendations] = useState([]);
  const [recGenres, setRecGenres] = useState([]);

  // Read values from URL params
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const selectedType = searchParams.get('type') || 'All';
  const selectedGenre = searchParams.get('genre') || '';
  const kidsMode = searchParams.get('kids') === 'true';

  // Helper to update URL params
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  // Set type filter
  const setSelectedType = (type) => {
    updateParams({ type, page: '1' });
  };

  // Set genre filter
  const setSelectedGenre = (genre) => {
    updateParams({ genre, page: '1' });
  };

  // Set kids mode filter
  const setKidsMode = (enabled) => {
    updateParams({ kids: enabled ? 'true' : '', page: '1' });
  };

  // Fetch genres on mount (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchGenres = async () => {
      try {
        const genreList = await showService.getGenres();
        setGenres(genreList);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, [isAuthenticated]);

  // Fetch shows (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    const fetchShows = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 15,
        };

        if (selectedType !== 'All') {
          params.type = selectedType;
        }

        if (selectedGenre) {
          params.genre = selectedGenre;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        if (kidsMode) {
          params.kids_mode = true;
        }

        const data = await showService.getShows(params);
        setShows(data.shows);
        setTotalPages(data.pages);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching shows:', error);
        toast.error('Failed to fetch shows');
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [currentPage, selectedType, selectedGenre, searchQuery, kidsMode, isAuthenticated]);

  // Fetch recommendations for authenticated users
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) return;
      
      try {
        const data = await showService.getRecommendations(10);
        setRecommendations(data.shows);
        setRecGenres(data.based_on_genres);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated]);

  const handlePageChange = (page) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  // Landing page for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        {/* Full screen centered popup */}
        <div className="fixed inset-0 bg-gradient-to-br from-netflix-black via-netflix-dark to-netflix-black">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-8 gap-2 p-4 h-full">
              {[...Array(32)].map((_, i) => (
                <div key={i} className="bg-netflix-red rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>
          
          {/* Centered Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-netflix-dark/95 backdrop-blur-xl rounded-2xl p-12 md:p-16 max-w-2xl mx-4 shadow-2xl border border-gray-800 text-center transform">
              {/* Logo */}
              <h1 className="text-6xl md:text-8xl font-bold text-netflix-red mb-8 tracking-tight">
                FLETNIX
              </h1>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Welcome Back!
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-4">
                Unlimited movies, TV shows, and more.
              </p>
              
              <p className="text-lg text-gray-400 mb-10">
                Sign in or create an account to start watching.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="bg-netflix-red text-white px-12 py-4 rounded-lg text-xl font-bold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-700 text-white px-12 py-4 rounded-lg text-xl font-bold hover:bg-gray-600 transition-all transform hover:scale-105 border border-gray-600"
                >
                  Sign Up
                </Link>
              </div>
              
              {/* Features */}
              <div className="mt-12 pt-8 border-t border-gray-700">
                <div className="flex flex-wrap justify-center gap-8 text-gray-400">
                  <div className="flex items-center gap-2">
                    <FiFilm className="w-5 h-5 text-netflix-red" />
                    <span>4000+ Titles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiStar className="w-5 h-5 text-netflix-red" />
                    <span>IMDB Ratings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiSearch className="w-5 h-5 text-netflix-red" />
                    <span>Smart Search</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-netflix-red/20 to-netflix-black py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            What to Watch on <span className="text-netflix-red">FletNix</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover thousands of movies and TV shows. Search, filter, and find your next binge-worthy content.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters - Always at top */}
        <div className="mb-6">
          <Filters
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            genres={genres}
            kidsMode={kidsMode}
            setKidsMode={setKidsMode}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Search indicator */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-center">
            <div className="bg-netflix-dark/80 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center gap-4">
              <p className="text-gray-400">
                Search results for: <span className="text-white font-medium">"{searchQuery}"</span>
              </p>
              <button
                onClick={() => updateParams({ search: '' })}
                className="text-netflix-red hover:text-red-400 font-medium"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* Results count - centered */}
        <div className="mb-6 text-center">
          <p className="text-gray-400">
            Showing <span className="text-white font-medium">{shows.length}</span> of{' '}
            <span className="text-white font-medium">{total}</span> results
          </p>
        </div>

        {/* Shows Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : shows.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="bg-netflix-dark/80 backdrop-blur-sm rounded-lg px-8 py-6 text-center">
              <p className="text-gray-400 text-xl mb-4">No shows found</p>
              <button
                onClick={handleClearFilters}
                className="text-netflix-red hover:text-red-400 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Recommendations - At bottom after results */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <Recommendations shows={recommendations} basedOnGenres={recGenres} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

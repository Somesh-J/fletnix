import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [selectedType, setSelectedType] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  
  const [recommendations, setRecommendations] = useState([]);
  const [recGenres, setRecGenres] = useState([]);

  const searchQuery = searchParams.get('search') || '';

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await showService.getGenres();
        setGenres(genreList);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch shows
  useEffect(() => {
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
  }, [currentPage, selectedType, selectedGenre, searchQuery]);

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
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSelectedType('All');
    setSelectedGenre('');
    setSearchParams({});
    setCurrentPage(1);
  };

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
        {/* Recommendations for logged in users */}
        {isAuthenticated && recommendations.length > 0 && (
          <Recommendations shows={recommendations} basedOnGenres={recGenres} />
        )}

        {/* Filters */}
        <div className="mt-8">
          <Filters
            selectedType={selectedType}
            setSelectedType={(type) => {
              setSelectedType(type);
              setCurrentPage(1);
            }}
            selectedGenre={selectedGenre}
            setSelectedGenre={(genre) => {
              setSelectedGenre(genre);
              setCurrentPage(1);
            }}
            genres={genres}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Search indicator */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-400">
              Search results for: <span className="text-white font-medium">"{searchQuery}"</span>
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setCurrentPage(1);
              }}
              className="text-netflix-red hover:text-red-400"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Results count */}
        <div className="mb-6">
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
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No shows found</p>
            <button
              onClick={handleClearFilters}
              className="mt-4 text-netflix-red hover:text-red-400"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

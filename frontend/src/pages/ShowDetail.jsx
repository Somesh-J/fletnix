import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiCalendar, FiClock, FiGlobe, FiUser, FiFilm } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ShowCard from '../components/ShowCard';
import { showService } from '../services/showService';
import { useAuth } from '../context/AuthContext';

const ShowDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  
  const [show, setShow] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowDetails = async () => {
      setLoading(true);
      try {
        // Fetch show details
        const showData = await showService.getShowById(id);
        setShow(showData);

        // Track view for recommendations (if authenticated)
        if (isAuthenticated) {
          try {
            await showService.trackView(id);
            // Fetch recommendations
            const recData = await showService.getRecommendations(5);
            setRecommendations(recData.shows.filter(s => s.id !== id));
          } catch (error) {
            console.error('Error tracking view:', error);
          }
        }

        // Fetch IMDB reviews
        try {
          const reviewData = await showService.getShowReviews(id);
          setReviews(reviewData);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      } catch (error) {
        console.error('Error fetching show:', error);
        toast.error('Failed to load show details');
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-400 text-xl mb-4">Show not found</p>
        <Link to="/" className="text-netflix-red hover:text-red-400">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    if (!rating) return 'bg-gray-600';
    if (['R', 'NC-17', 'TV-MA'].includes(rating)) return 'bg-red-600';
    if (['PG-13', 'TV-14'].includes(rating)) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/30 via-netflix-black/80 to-netflix-black" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Browse
          </Link>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-netflix-red/20 to-netflix-dark rounded-lg overflow-hidden shadow-2xl aspect-[2/3] flex items-center justify-center">
                {reviews?.poster ? (
                  <img
                    src={reviews.poster}
                    alt={show.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl font-bold text-white/20">
                    {show.title?.charAt(0) || 'F'}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-2">
              {/* Type Badge */}
              <span className={`inline-block ${show.type === 'Movie' ? 'bg-blue-600' : 'bg-green-600'} text-white text-sm px-3 py-1 rounded mb-4`}>
                {show.type}
              </span>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {show.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
                {show.release_year && (
                  <div className="flex items-center">
                    <FiCalendar className="mr-2" />
                    {show.release_year}
                  </div>
                )}
                {show.duration && (
                  <div className="flex items-center">
                    <FiClock className="mr-2" />
                    {show.duration}
                  </div>
                )}
                {show.rating && (
                  <span className={`${getRatingColor(show.rating)} text-white px-2 py-1 rounded text-sm`}>
                    {show.rating}
                  </span>
                )}
              </div>

              {/* IMDB Rating */}
              {reviews?.imdb_rating && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center bg-yellow-500/20 px-4 py-2 rounded-lg">
                    <FiStar className="text-yellow-500 mr-2" />
                    <span className="text-yellow-500 font-bold text-xl">
                      {reviews.imdb_rating}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">/10</span>
                  </div>
                  {reviews.imdb_votes && (
                    <span className="text-gray-400 text-sm">
                      ({reviews.imdb_votes} votes)
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {show.description || 'No description available.'}
              </p>

              {/* Genres */}
              {show.listed_in && (
                <div className="mb-6">
                  <h3 className="text-gray-400 text-sm mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {show.listed_in.split(',').map((genre, index) => (
                      <span
                        key={index}
                        className="bg-netflix-dark text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {show.director && (
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1 flex items-center">
                      <FiFilm className="mr-2" /> Director
                    </h3>
                    <p className="text-white">{show.director}</p>
                  </div>
                )}
                {show.country && (
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1 flex items-center">
                      <FiGlobe className="mr-2" /> Country
                    </h3>
                    <p className="text-white">{show.country}</p>
                  </div>
                )}
              </div>

              {/* Cast */}
              {show.cast && (
                <div className="mt-6">
                  <h3 className="text-gray-400 text-sm mb-2 flex items-center">
                    <FiUser className="mr-2" /> Cast
                  </h3>
                  <p className="text-gray-300">{show.cast}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews && reviews.reviews && reviews.reviews.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Ratings & Reviews</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {reviews.reviews.map((review, index) => (
              <div key={index} className="bg-netflix-dark rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">{review.source}</h3>
                <p className="text-white text-2xl font-bold">{review.rating}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">More Like This</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recommendations.map((rec) => (
              <ShowCard key={rec.id} show={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowDetail;

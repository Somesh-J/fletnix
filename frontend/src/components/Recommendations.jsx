import ShowCard from './ShowCard';

const Recommendations = ({ shows, basedOnGenres }) => {
  if (!shows || shows.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">
          Recommended For You
        </h2>
        {basedOnGenres && basedOnGenres.length > 0 && (
          <p className="text-gray-400 text-sm">
            Based on: {basedOnGenres.slice(0, 3).join(', ')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;

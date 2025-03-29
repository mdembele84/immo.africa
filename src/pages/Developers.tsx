import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Developer {
  id: string;
  company_name: string;
  description: string;
  logo_url: string;
  website: string;
  phone: string;
  email: string;
  avg_rating: number;
  total_reviews: number;
  total_properties: number;
  available_properties: number;
}

export function Developers() {
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDevelopers() {
      try {
        setError(null);
        const { data: developersData, error: developersError } = await supabase
          .from('developers')
          .select(`
            *,
            developer_reviews(count),
            properties(
              id,
              status
            )
          `);

        if (developersError) throw developersError;

        const processedDevelopers = developersData.map(dev => {
          const totalProperties = dev.properties.length;
          const availableProperties = dev.properties.filter(p => p.status === 'available').length;
          const avgRating = dev.developer_reviews[0].count > 0 ? 4.5 : 0; // Hardcoded for now

          return {
            ...dev,
            avg_rating: avgRating,
            total_reviews: dev.developer_reviews[0].count,
            total_properties: totalProperties,
            available_properties: availableProperties
          };
        });

        setDevelopers(processedDevelopers);
      } catch (error) {
        console.error('Error fetching developers:', error);
        setError('Une erreur est survenue lors de la récupération des promoteurs.');
      } finally {
        setLoading(false);
      }
    }

    fetchDevelopers();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Nos Promoteurs Immobiliers
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map(developer => (
          <div
            key={developer.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/developer/${developer.id}`)}
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={developer.logo_url}
                  alt={developer.company_name}
                  className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {developer.company_name}
                  </h2>
                  <div className="mt-1 flex items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {developer.avg_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-600">
                      {developer.total_reviews} avis
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                {developer.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {developer.total_properties}
                  </div>
                  <div className="text-sm text-gray-600">Biens au total</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {developer.available_properties}
                  </div>
                  <div className="text-sm text-gray-600">Biens disponibles</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {developers.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucun promoteur n'est disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
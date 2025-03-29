import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import type { Property } from '../types';

export function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchFavorites() {
      try {
        setError(null);
        const { data, error: favoritesError } = await supabase
          .from('property_favorites')
          .select(`
            property:properties (
              id,
              title,
              description,
              type,
              price,
              image_url,
              location,
              status,
              country:countries!inner(
                code,
                name
              ),
              payment_schedule:property_payment_schedules!inner(
                initial_payment,
                monthly_payment,
                duration
              ),
              details:property_details(
                surface,
                bedrooms,
                bathrooms,
                matterport_id,
                floor_plan_url
              ),
              developer:developers(
                id,
                company_name,
                logo_url,
                description,
                website,
                phone,
                email,
                developer_reviews(count)
              )
            )
          `)
          .eq('user_id', user.id);

        if (favoritesError) throw favoritesError;

        const properties = data
          .map(item => {
            const property = item.property;
            if (!property) return null;

            return {
              id: property.id,
              title: property.title,
              description: property.description,
              type: property.type,
              price: property.price,
              imageUrl: property.image_url,
              location: property.location,
              country: property.country,
              coordinates: { lat: 0, lng: 0 }, // Not needed here
              status: property.status,
              paymentSchedule: property.payment_schedule,
              details: property.details?.[0],
              developer: property.developer ? {
                id: property.developer.id,
                company_name: property.developer.company_name,
                logo_url: property.developer.logo_url,
                description: property.developer.description,
                website: property.developer.website,
                phone: property.developer.phone,
                email: property.developer.email,
                total_reviews: property.developer.developer_reviews[0].count
              } : undefined
            };
          })
          .filter((p): p is Property => p !== null);

        setFavorites(properties);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('Une erreur est survenue lors de la récupération de vos favoris.');
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [user, navigate]);

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
        Mes Favoris
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>{error}</p>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun favori</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par explorer nos biens disponibles et ajoutez-les à vos favoris.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/properties')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Voir les biens disponibles
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
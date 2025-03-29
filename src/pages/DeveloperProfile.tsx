import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Globe, Phone, Mail, Star, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils';
import { useCurrency } from '../contexts/CurrencyContext';
import { PropertyCard } from '../components/PropertyCard';
import type { Property } from '../types';

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
  total_sales: number;
  properties: Property[];
  reviews: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_id: string;
  }[];
}

export function DeveloperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'sold'>('available');

  useEffect(() => {
    if (!id) return;

    async function fetchDeveloper() {
      try {
        setError(null);
        const { data: developerData, error: developerError } = await supabase
          .from('developers')
          .select(`
            *,
            properties!inner(
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
              )
            ),
            developer_reviews(
              id,
              rating,
              comment,
              created_at,
              user_id
            )
          `)
          .eq('id', id)
          .single();

        if (developerError) throw developerError;

        if (!developerData) {
          setError('Promoteur non trouvé');
          setLoading(false);
          return;
        }

        // Transform properties data to match Property type
        const transformedProperties = developerData.properties.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          type: p.type,
          price: p.price,
          imageUrl: p.image_url,
          location: p.location,
          country: p.country,
          coordinates: { lat: 0, lng: 0 }, // We don't need coordinates here
          status: p.status,
          paymentSchedule: p.payment_schedule,
          details: p.details?.[0],
          developer: {
            id: developerData.id,
            company_name: developerData.company_name,
            logo_url: developerData.logo_url,
            description: developerData.description,
            website: developerData.website,
            phone: developerData.phone,
            email: developerData.email,
            total_reviews: developerData.developer_reviews?.length || 0
          }
        }));

        // Calculate average rating
        const reviews = developerData.developer_reviews || [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
          : 0;

        setDeveloper({
          ...developerData,
          properties: transformedProperties,
          reviews: reviews,
          avg_rating: avgRating,
          total_reviews: reviews.length,
          total_sales: transformedProperties.filter(p => p.status === 'sold').length
        });
      } catch (error) {
        console.error('Error fetching developer:', error);
        setError('Une erreur est survenue lors de la récupération des informations du promoteur.');
      } finally {
        setLoading(false);
      }
    }

    fetchDeveloper();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !developer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {error || 'Promoteur non trouvé'}
          </h2>
          <button
            onClick={() => navigate('/developers')}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <Building2 className="h-5 w-5 mr-2" />
            Retour aux promoteurs
          </button>
        </div>
      </div>
    );
  }

  const availableProperties = developer.properties.filter(p => p.status === 'available');
  const soldProperties = developer.properties.filter(p => p.status === 'sold');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-start space-x-6">
          <img
            src={developer.logo_url}
            alt={developer.company_name}
            className="h-24 w-24 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{developer.company_name}</h1>
            <p className="mt-2 text-gray-600">{developer.description}</p>
            <div className="mt-4 flex items-center space-x-6">
              <a
                href={developer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Globe className="h-5 w-5 mr-2" />
                Site web
              </a>
              <a
                href={`tel:${developer.phone}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Phone className="h-5 w-5 mr-2" />
                {developer.phone}
              </a>
              <a
                href={`mailto:${developer.email}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Mail className="h-5 w-5 mr-2" />
                {developer.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500">Note moyenne</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold text-gray-900">
              {developer.avg_rating.toFixed(1)}
            </div>
            <div className="ml-2 flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm text-gray-500">
                ({developer.total_reviews} avis)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500">Ventes réalisées</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold text-gray-900">
              {developer.total_sales}
            </div>
            <div className="ml-2 text-sm text-gray-500">propriétés</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500">Biens disponibles</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold text-gray-900">
              {availableProperties.length}
            </div>
            <div className="ml-2 text-sm text-gray-500">propriétés</div>
          </div>
        </div>
      </div>

      {/* Properties Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Biens disponibles ({availableProperties.length})
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`${
                activeTab === 'sold'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Biens vendus ({soldProperties.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {(activeTab === 'available' ? availableProperties : soldProperties).map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
        {(activeTab === 'available' ? availableProperties : soldProperties).length === 0 && (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">
              {activeTab === 'available' 
                ? 'Aucun bien disponible pour le moment.'
                : 'Aucun bien vendu pour le moment.'}
            </p>
          </div>
        )}
      </div>

      {/* Reviews */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Avis clients</h2>
      <div className="space-y-6">
        {developer.reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun avis</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ce promoteur n'a pas encore reçu d'avis.
            </p>
          </div>
        ) : (
          developer.reviews.map(review => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 font-medium text-gray-900">
                    Utilisateur #{review.user_id.slice(0, 8)}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-gray-600">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
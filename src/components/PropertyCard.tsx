import React, { useState, useEffect } from 'react';
import { MapPin, Home, Bed, Bath, Square, Building2, Heart, Star } from 'lucide-react';
import { Property } from '../types';
import { formatCurrency } from '../utils';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AuthModal } from './AuthModal';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { currency } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [developerStats, setDeveloperStats] = useState<{
    totalSold: number;
    totalAvailable: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
    if (property.developer) {
      fetchDeveloperStats();
    }
  }, [user, property.id, property.developer]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', property.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully
      
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const fetchDeveloperStats = async () => {
    if (!property.developer) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('status')
        .eq('developer_id', property.developer.id);

      if (error) throw error;

      const totalSold = data.filter(p => p.status === 'sold').length;
      const totalAvailable = data.filter(p => p.status === 'available').length;

      setDeveloperStats({ totalSold, totalAvailable });
    } catch (error) {
      console.error('Error fetching developer stats:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);
      if (isFavorite) {
        await supabase
          .from('property_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);
      } else {
        await supabase
          .from('property_favorites')
          .insert({
            user_id: user.id,
            property_id: property.id
          });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isFavorite 
                ? 'bg-red-100 text-red-600' 
                : 'bg-white/80 text-gray-600 hover:bg-white'
            } transition-colors`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {property.type === 'land' ? 'Terrain' : 'Maison'}
            </span>
          </div>
          
          <div className="mt-2 flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.location}</span>
            <span className="mx-2">•</span>
            <span className="text-sm text-blue-600">{property.country.name}</span>
          </div>

          {property.developer && (
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Link
                  to={`/developer/${property.developer.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center space-x-2 text-gray-900 hover:text-blue-600"
                >
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">{property.developer.company_name}</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-xs text-gray-600">
                      {property.developer.total_reviews} avis
                    </span>
                  </div>
                  {developerStats && (
                    <>
                      <span className="text-gray-300">|</span>
                      <div className="text-xs">
                        <span className="text-gray-600">{developerStats.totalSold} ventes</span>
                        <span className="mx-1">•</span>
                        <span className="text-blue-600">{developerStats.totalAvailable} dispo.</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {property.type === 'house' && property.details && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="flex items-center text-gray-600">
                <Bed className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.details.bedrooms} Ch.</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Bath className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.details.bathrooms} SdB</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Square className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.details.surface}m²</span>
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(property.price, currency)} {currency}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {formatCurrency(property.paymentSchedule.monthlyPayment, currency)} {currency}/mois
            </div>
          </div>

          <Link
            to={`/property/${property.id}`}
            className="mt-4 block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            Voir les Détails
          </Link>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
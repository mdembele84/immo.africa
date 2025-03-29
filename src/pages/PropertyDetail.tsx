import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Building2, Globe, Phone, Mail, Star, MapPin, Calendar, CreditCard, Info, FileText, Heart, ArrowLeft, Square, Bed, Bath, Clock } from 'lucide-react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Property } from '../types';
import { formatCurrency } from '../utils';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { LoanConditionsModal } from '../components/LoanConditionsModal';
import { AuthModal } from '../components/AuthModal';
import { PropertyTabs } from '../components/PropertyTabs';
import { GOOGLE_MAPS_API_KEY } from '../lib/maps';
import { supabase } from '../lib/supabase';
import { fetchProperty } from '../lib/properties';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

export function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | '3d-tour' | 'floor-plan'>('photos');
  const { currency } = useCurrency();
  const { user } = useAuth();
  const [showLoanConditions, setShowLoanConditions] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [developerStats, setDeveloperStats] = useState<{
    totalSold: number;
    totalAvailable: number;
  } | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', property?.id)
        .maybeSingle();
      
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  useEffect(() => {
    if (!id) return;

    async function loadProperty() {
      try {
        setLoading(true);
        const propertyData = await fetchProperty(id);
        
        if (!propertyData) {
          setError('Propriété non trouvée');
          return;
        }

        setProperty(propertyData);

        if (user) {
          checkFavoriteStatus();
        }

        if (propertyData.developer) {
          const { data: developerProperties, error: statsError } = await supabase
            .from('properties')
            .select('status')
            .eq('developer_id', propertyData.developer.id);

          if (!statsError && developerProperties) {
            const totalSold = developerProperties.filter(p => p.status === 'sold').length;
            const totalAvailable = developerProperties.filter(p => p.status === 'available').length;
            setDeveloperStats({ totalSold, totalAvailable });
          }
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Une erreur est survenue lors de la récupération des informations de la propriété.');
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id, user, navigate]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!property) return;

    try {
      setFavoriteLoading(true);
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
      setFavoriteLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!property) return;

    try {
      // Create purchase record first
      const { data: purchase, error: purchaseError } = await supabase
        .from('property_purchases')
        .insert({
          user_id: user.id,
          property_id: property.id,
          status: 'pending_kyc'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Check if user profile exists and is verified
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('kyc_verified')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // If profile exists and is verified, update purchase status
      if (profile?.kyc_verified === true) {
        const { error: updateError } = await supabase
          .from('property_purchases')
          .update({
            status: 'pending_payment',
            updated_at: new Date().toISOString()
          })
          .eq('id', purchase.id);

        if (updateError) throw updateError;

        navigate(`/payment/${purchase.id}`);
      } else {
        // If not verified or no profile, start KYC process
        navigate(`/purchase/personal?propertyId=${property.id}`);
      }
    } catch (error) {
      console.error('Error handling purchase:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {error || 'Propriété non trouvée'}
        </h2>
        <button
          onClick={() => navigate('/properties')}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour aux propriétés
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/properties')}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour aux propriétés
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Property Images and Details */}
        <div>
          {property && (
            <PropertyTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              imageUrl={property.imageUrl}
              matterportId={property.details?.matterportId}
              floorPlanUrl={property.details?.floorPlanUrl}
            />
          )}

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              <button
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={`p-2 rounded-full ${
                  isFavorite 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <div className="flex items-center mt-4 text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
              <span className="mx-2">•</span>
              <span className="text-blue-600">{property.country.name}</span>
            </div>

            {property.developer && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-6 w-6 text-gray-500" />
                    <div>
                      <Link
                        to={`/developer/${property.developer.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600"
                      >
                        {property.developer.company_name}
                      </Link>
                      <div className="flex items-center mt-1 space-x-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">
                            {property.developer.total_reviews} avis
                          </span>
                        </div>
                        {developerStats && (
                          <>
                            <span className="text-gray-300">|</span>
                            <div className="text-sm">
                              <span className="text-gray-600">{developerStats.totalSold} ventes</span>
                              <span className="mx-1">•</span>
                              <span className="text-blue-600">{developerStats.totalAvailable} dispo.</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/developer/${property.developer.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Voir le profil →
                  </Link>
                </div>
              </div>
            )}

            {property.type === 'house' && property.details && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Caractéristiques</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Square className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{property.details.surface}m²</span>
                  </div>
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{property.details.bedrooms} Ch.</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{property.details.bathrooms} SdB</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {property.requiredDocuments && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents Requis</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-4">
                    {property.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-start">
                        <FileText className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{doc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Localisation</h2>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={property.coordinates}
                  zoom={15}
                >
                  <Marker position={property.coordinates} />
                </GoogleMap>
              ) : (
                <div className="h-[400px] bg-gray-100 flex items-center justify-center">
                  <p>Chargement de la carte...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Payment Schedule and Purchase Button */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan de Paiement</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Prix</span>
                  <span className="text-xl font-semibold">
                    {formatCurrency(property.price, currency)} {currency}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Statut</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Disponible
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-600">Premier Versement</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(property.paymentSchedule.initialPayment, currency)} {currency}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-600">Mensualité</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(property.paymentSchedule.monthlyPayment, currency)} {currency}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-600">Durée</span>
                  </div>
                  <span className="font-semibold">{property.paymentSchedule.duration} mois</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Récapitulatif des Paiements</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Premier Versement Total</span>
                    <span className="font-medium">
                      {formatCurrency(property.paymentSchedule.initialPayment, currency)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total des Mensualités</span>
                    <span className="font-medium">
                      {formatCurrency(property.paymentSchedule.monthlyPayment * property.paymentSchedule.duration, currency)} {currency}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-medium">Montant Total</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(property.price, currency)} {currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {user ? "Initier l'Achat" : "Se connecter pour acheter"}
              </button>

              <button
                onClick={() => setShowLoanConditions(true)}
                className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <Building2 className="h-5 w-5" />
                <span>Voir les conditions de financement BMS</span>
              </button>

              <p className="text-sm text-gray-500 text-center">
                En continuant, vous acceptez nos conditions générales
              </p>
            </div>
          </div>
        </div>
      </div>

      <LoanConditionsModal
        isOpen={showLoanConditions}
        onClose={() => setShowLoanConditions(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Building2, Clock, CreditCard, Users, MapPin, ArrowRight, BookOpen, Lightbulb, Shield, Search, Home as HomeIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { Testimonials } from '../components/Testimonials';
import { supabase } from '../lib/supabase';
import type { Property } from '../types';

const countries = [
  { code: 'ML', name: 'Mali' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'SN', name: 'Sénégal' }
];

export function Home() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    country: '',
    type: ''
  });

  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            country:countries!inner(*),
            payment_schedule:property_payment_schedules!inner(*),
            details:property_details(*),
            required_documents(*),
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
          `)
          .eq('status', 'available')
          .limit(3);

        if (error) throw error;

        const transformedProperties = data.map(p => {
          const coordinates = p.coordinates?.slice(1, -1).split(',').map(Number);
          
          return {
            id: p.id,
            title: p.title,
            description: p.description,
            type: p.type,
            price: p.price,
            imageUrl: p.image_url,
            location: p.location,
            country: {
              code: p.country.code,
              name: p.country.name
            },
            coordinates: coordinates ? {
              lat: coordinates[1],
              lng: coordinates[0]
            } : { lat: 0, lng: 0 },
            status: p.status,
            paymentSchedule: {
              initialPayment: p.payment_schedule.initial_payment,
              monthlyPayment: p.payment_schedule.monthly_payment,
              duration: p.payment_schedule.duration
            },
            ...(p.details?.[0] && {
              details: {
                surface: p.details[0].surface,
                bedrooms: p.details[0].bedrooms,
                bathrooms: p.details[0].bathrooms,
                matterportId: p.details[0].matterport_id,
                floorPlanUrl: p.details[0].floor_plan_url
              }
            }),
            requiredDocuments: p.required_documents.map(doc => ({
              name: doc.name,
              description: doc.description
            })),
            ...(p.developer && {
              developer: {
                id: p.developer.id,
                company_name: p.developer.company_name,
                logo_url: p.developer.logo_url,
                description: p.developer.description,
                website: p.developer.website,
                phone: p.developer.phone,
                email: p.developer.email,
                total_reviews: p.developer.developer_reviews[0].count
              }
            })
          };
        });

        setFeaturedProperties(transformedProperties);
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.country) params.append('country', searchParams.country);
    if (searchParams.type) params.append('type', searchParams.type);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Votre Propriété en Afrique
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Achetez votre bien immobilier en toute simplicité avec des plans de paiement flexibles.
              Simple, transparent et sécurisé.
            </p>
            
            <div className="mt-10 max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <select
                      value={searchParams.country}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tous les pays</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={searchParams.type}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Type de bien</option>
                      <option value="house">Maison</option>
                      <option value="land">Terrain</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Search className="h-5 w-5" />
                    <span>Rechercher</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Une Plateforme de Confiance
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez une nouvelle façon d'acheter votre bien immobilier en Afrique, 
              avec des promoteurs vérifiés et des paiements échelonnés.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Promoteurs Vérifiés</h3>
                <p className="mt-2 text-base text-gray-500">
                  Tous nos promoteurs sont rigoureusement sélectionnés et leurs références vérifiées 
                  pour garantir votre investissement.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Paiement Échelonné</h3>
                <p className="mt-2 text-base text-gray-500">
                  Profitez de plans de paiement flexibles sur mesure, avec un apport initial 
                  et des mensualités adaptées à votre budget.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Processus Sécurisé</h3>
                <p className="mt-2 text-base text-gray-500">
                  Un parcours d'achat transparent et sécurisé, avec vérification KYC 
                  et documentation complète à chaque étape.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Accompagnement Dédié</h3>
                <p className="mt-2 text-base text-gray-500">
                  Une équipe d'experts vous accompagne tout au long de votre projet, 
                  du choix du bien jusqu'à la remise des clés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Biens Immobiliers Sélectionnés
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Découvrez notre sélection de propriétés premium en Afrique de l'Ouest
              </p>
            </div>
            <Link
              to="/properties"
              className="hidden sm:flex items-center text-blue-600 hover:text-blue-800"
            >
              Voir tous les biens
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                  <div className="bg-white p-4 rounded-b-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/properties"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Voir tous les biens
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Buying Tips Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Conseils pour Acheter en Afrique
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Tout ce que vous devez savoir pour réussir votre investissement immobilier
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Guide des Documents
              </h3>
              <p className="text-gray-600">
                Comprendre les documents essentiels pour une transaction immobilière sécurisée en Afrique : 
                titres fonciers, permis de construire, et attestations diverses.
              </p>
              <Link
                to="/guides/documents"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                En savoir plus
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Choisir son Emplacement
              </h3>
              <p className="text-gray-600">
                Les critères clés pour sélectionner le meilleur emplacement : infrastructures, 
                développement futur, et potentiel de valorisation.
              </p>
              <Link
                to="/guides/location"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                En savoir plus
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sécuriser son Investissement
              </h3>
              <p className="text-gray-600">
                Les étapes essentielles pour protéger votre investissement : 
                vérifications légales, choix du promoteur, et garanties bancaires.
              </p>
              <Link
                to="/guides/security"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                En savoir plus
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
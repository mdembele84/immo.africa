import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { fetchProperties } from '../lib/properties';

const countries = [
  { code: 'ML', name: 'Mali' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'SN', name: 'Sénégal' }
];

export function Properties() {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const countryFromUrl = searchParams.get('country');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'land' | 'house'>(
    typeFromUrl === 'land' || typeFromUrl === 'house' ? typeFromUrl : 'all'
  );
  const [selectedCountry, setSelectedCountry] = useState<string>(countryFromUrl || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300000000]);
  const [showFilters, setShowFilters] = useState(false);
  const { currency } = useCurrency();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeFromUrl === 'land' || typeFromUrl === 'house') {
      setSelectedType(typeFromUrl);
    }
    if (countryFromUrl) {
      setSelectedCountry(countryFromUrl);
    }
  }, [typeFromUrl, countryFromUrl]);

  useEffect(() => {
    async function loadProperties() {
      try {
        setError(null);
        setLoading(true);

        const filters = {
          type: selectedType === 'all' ? undefined : selectedType,
          countryCode: selectedCountry === 'all' ? undefined : selectedCountry,
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < 300000000 ? priceRange[1] : undefined,
          search: searchTerm || undefined
        };

        const data = await fetchProperties(filters);
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Une erreur est survenue lors de la récupération des biens.');
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [selectedType, selectedCountry, priceRange, searchTerm]);

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
      {/* Search and Filter Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedType === 'house' ? 'Maisons Disponibles' : 
             selectedType === 'land' ? 'Terrains Disponibles' : 
             'Propriétés Disponibles'}
            {selectedCountry !== 'all' && 
              ` en ${countries.find(c => c.code === selectedCountry)?.name}`}
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filtres</span>
          </button>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ville ou type de propriété..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de Propriété
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'all' | 'land' | 'house')}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les Types</option>
                  <option value="land">Terrain</option>
                  <option value="house">Maison</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les Pays</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fourchette de Prix
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="300000000"
                    step="1000000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">
                    Jusqu'à {(priceRange[1] / 1000000).toFixed(0)}M {currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>{error}</p>
        </div>
      )}

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {properties.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucune propriété ne correspond à vos critères.
          </p>
        </div>
      )}
    </div>
  );
}
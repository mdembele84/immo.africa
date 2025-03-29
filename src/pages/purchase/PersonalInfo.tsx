import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { IntroMessage } from './IntroMessage';
import { PurchaseSteps } from '../../components/PurchaseSteps';
import { User, Phone, Globe, ArrowRight } from 'lucide-react';

export function PersonalInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    country: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<'not_started' | 'in_progress' | 'verified'>('not_started');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    async function fetchUserProfile() {
      try {
        setError(null);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          if (error.code === 'PGRST116') {
            setLoading(false);
            return;
          }
          throw error;
        }

        if (data) {
          setFormData({
            lastName: data.last_name || '',
            firstName: data.first_name || '',
            country: data.country || '',
            phone: data.phone || ''
          });

          if (data.kyc_verified) {
            setKycStatus('verified');
          } else if (data.kyc_verified === false) {
            setKycStatus('in_progress');
          }
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching user profile:', error);
        setError('Une erreur est survenue lors de la récupération de vos informations. Veuillez réessayer.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setError(null);

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const profileData = {
        user_id: user.id,
        last_name: formData.lastName,
        first_name: formData.firstName,
        country: formData.country,
        phone: formData.phone,
        updated_at: new Date().toISOString()
      };

      let error;

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([profileData]);
        error = insertError;
      }

      if (error) throw error;

      navigate('/purchase/professional');
    } catch (error) {
      console.error('Error saving personal info:', error);
      setError('Une erreur est survenue lors de la sauvegarde des informations. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="space-y-6">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Commençons par vos informations personnelles
          </h1>
          <p className="mt-2 text-gray-600">
            Ces informations nous permettront de personnaliser votre expérience d'achat
          </p>
        </div>

        <PurchaseSteps kycStatus={kycStatus} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <IntroMessage />

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Identité</h3>
                  <p className="text-sm">Vos informations personnelles</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-600">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Résidence</h3>
                  <p className="text-sm">Votre pays de résidence</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-600">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Contact</h3>
                  <p className="text-sm">Vos coordonnées</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Pays de Résidence
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un pays</option>
                    <option value="ML">Mali</option>
                    <option value="SN">Sénégal</option>
                    <option value="CI">Côte d'Ivoire</option>
                    <option value="FR">France</option>
                    <option value="BE">Belgique</option>
                    <option value="DE">Allemagne</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="+33 6 12 34 56 78"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
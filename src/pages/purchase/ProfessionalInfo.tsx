import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { PurchaseSteps } from '../../components/PurchaseSteps';

const ACTIVITIES = [
  'Salarié du secteur privé',
  'Fonctionnaire',
  'Entrepreneur',
  'Profession libérale',
  'Commerçant',
  'Retraité',
  'Autre'
];

const REVENUE_RANGES = [
  'Moins de 500 000 FCFA',
  '500 000 - 1 000 000 FCFA',
  '1 000 000 - 2 000 000 FCFA',
  '2 000 000 - 5 000 000 FCFA',
  'Plus de 5 000 000 FCFA'
];

export function ProfessionalInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    activity: '',
    revenue: ''
  });
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<'not_started' | 'in_progress' | 'verified'>('not_started');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchUserProfile() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setFormData({
            activity: data.professional_activity || '',
            revenue: data.revenue_range || ''
          });

          // Set KYC status
          if (data.kyc_verified) {
            setKycStatus('verified');
          } else if (data.kyc_verified === false) {
            setKycStatus('in_progress');
          }

          // If all required fields are filled, redirect to next step
          if (data.professional_activity && data.revenue_range) {
            const isEuropeanNumber = data.phone?.startsWith('+33') || 
                                   data.phone?.startsWith('+32') || 
                                   data.phone?.startsWith('+49');
            navigate(isEuropeanNumber ? '/purchase/residency' : '/purchase/kyc');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || kycStatus !== 'not_started') return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          professional_activity: formData.activity,
          revenue_range: formData.revenue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select('phone')
        .single();

      if (error) throw error;

      const isEuropeanNumber = data?.phone?.startsWith('+33') || 
                              data?.phone?.startsWith('+32') || 
                              data?.phone?.startsWith('+49');

      navigate(isEuropeanNumber ? '/purchase/residency' : '/purchase/kyc');
    } catch (error) {
      console.error('Error saving professional info:', error);
      alert('Une erreur est survenue lors de la sauvegarde des informations.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
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
    );
  }

  if (kycStatus !== 'not_started') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Informations Professionnelles
        </h1>
        <PurchaseSteps kycStatus={kycStatus} />
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800">
            Vous ne pouvez plus modifier vos informations car votre dossier KYC est {
              kycStatus === 'in_progress' ? 'en cours de vérification' : 'déjà vérifié'
            }.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Retour au profil →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Informations Professionnelles
      </h1>

      <PurchaseSteps kycStatus={kycStatus} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="activity" className="block text-sm font-medium text-gray-700">
            Activité Professionnelle
          </label>
          <select
            id="activity"
            value={formData.activity}
            onChange={(e) => setFormData(prev => ({ ...prev, activity: e.target.value }))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionnez une activité</option>
            {ACTIVITIES.map(activity => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="revenue" className="block text-sm font-medium text-gray-700">
            Tranche de Revenus Mensuels
          </label>
          <select
            id="revenue"
            value={formData.revenue}
            onChange={(e) => setFormData(prev => ({ ...prev, revenue: e.target.value }))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionnez une tranche</option>
            {REVENUE_RANGES.map(range => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continuer
          </button>
        </div>
      </form>
    </div>
  );
}
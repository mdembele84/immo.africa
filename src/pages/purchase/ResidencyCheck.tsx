import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { PurchaseSteps } from '../../components/PurchaseSteps';

export function ResidencyCheck() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
          .select()
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        // Set KYC status
        if (data.kyc_verified) {
          setKycStatus('verified');
        } else if (data.kyc_verified === false) {
          setKycStatus('in_progress');
        }

        // If residency status is already set, move to next step
        if (data?.has_eu_residency !== null) {
          navigate('/purchase/kyc');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [user, navigate]);
  
  const handleChoice = async (hasResidency: boolean) => {
    if (!user || kycStatus !== 'not_started') return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          has_eu_residency: hasResidency,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      navigate('/purchase/kyc');
    } catch (error) {
      console.error('Error saving residency info:', error);
      alert('Une erreur est survenue lors de la sauvegarde des informations.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
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
          Vérification de Résidence
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
        Vérification de Résidence
      </h1>

      <PurchaseSteps kycStatus={kycStatus} />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-lg text-gray-700 mb-8">
          Disposez-vous d'un titre de séjour ou d'une carte nationale d'identité de l'Union Européenne ?
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleChoice(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Oui, je dispose d'un titre de séjour ou d'une carte d'identité UE
          </button>

          <button
            onClick={() => handleChoice(false)}
            className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Non, je ne dispose pas de ces documents
          </button>
        </div>
      </div>
    </div>
  );
}
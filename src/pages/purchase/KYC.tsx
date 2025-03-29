import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Clock } from 'lucide-react';
import { PurchaseSteps } from '../../components/PurchaseSteps';

type VerificationStatus = 'not_started' | 'in_progress' | 'verified';

export function KYC() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const propertyId = new URLSearchParams(location.search).get('propertyId');
  const [status, setStatus] = useState<VerificationStatus>('not_started');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function checkVerificationStatus() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('kyc_verified')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        // Map database values to status
        if (data.kyc_verified === true) {
          setStatus('verified');
        } else if (data.kyc_verified === false) {
          setStatus('in_progress');
        } else {
          setStatus('not_started');
        }

        // If propertyId is provided and KYC not started, create a purchase record
        if (propertyId && data.kyc_verified === null) {
          const { error: purchaseError } = await supabase
            .from('property_purchases')
            .insert({
              user_id: user.id,
              property_id: propertyId,
              status: 'pending_kyc'
            });

          if (purchaseError) throw purchaseError;
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      } finally {
        setLoading(false);
      }
    }

    checkVerificationStatus();
  }, [user, navigate, propertyId]);

  const handleDocumentsSubmitted = async () => {
    if (!user) return;

    try {
      setUpdating(true);

      // Update user profile KYC status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          kyc_verified: true,
          kyc_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update purchase status if this was initiated from a property purchase
      if (propertyId) {
        const { error: purchaseError } = await supabase
          .from('property_purchases')
          .update({
            status: 'pending_payment',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (purchaseError) throw purchaseError;

        // Redirect to the purchase detail page
        const { data: purchaseData } = await supabase
          .from('property_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('property_id', propertyId)
          .single();

        if (purchaseData) {
          navigate(`/purchases/${purchaseData.id}`);
          return;
        }
      }

      setStatus('verified');
      // Redirect to profile page after a short delay if no purchase is involved
      setTimeout(() => navigate('/profile'), 1500);
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut de vérification.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Vérification d'Identité
      </h1>

      <PurchaseSteps kycStatus={status} />

      <div className="bg-white rounded-lg shadow-sm p-6">
        {status === 'verified' ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Vérification Complétée
            </h2>
            <p className="text-gray-600">
              Votre identité a été vérifiée avec succès.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retour au profil
            </button>
          </div>
        ) : (
          <>
            <p className="text-lg text-gray-700 mb-6">
              Pour finaliser votre dossier, nous devons vérifier votre identité. 
              Cette étape est réalisée en partenariat avec SumSub, un service sécurisé 
              de vérification d'identité.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <h2 className="font-medium text-gray-900 mb-2">
                Documents nécessaires :
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Pièce d'identité (Passeport, Carte d'identité)</li>
                <li>Photo de vous (selfie)</li>
                <li>Justificatif de domicile de moins de 3 mois</li>
              </ul>
            </div>

            <div className="h-[600px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-8">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Interface SumSub de vérification d'identité</p>
                <p className="text-sm text-gray-500">(En cours d'intégration)</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleDocumentsSubmitted}
                disabled={updating}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  updating ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {updating ? 'Enregistrement...' : "J'ai soumis mes documents KYC"}
              </button>
              <p className="mt-3 text-sm text-gray-500 text-center">
                Cliquez sur ce bouton uniquement après avoir soumis tous vos documents de vérification
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
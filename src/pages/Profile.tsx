import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, FileText, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PurchaseSteps } from '../components/PurchaseSteps';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  phone: string | null;
  professional_activity: string | null;
  revenue_range: string | null;
  has_eu_residency: boolean | null;
  kyc_verified: boolean | null;
  kyc_verified_at: string | null;
}

interface PendingPurchase {
  id: string;
  property_id: string;
  status: 'pending_kyc' | 'pending_documents' | 'pending_payment' | 'processing' | 'completed' | 'cancelled';
  property: {
    title: string;
  };
}

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchProfile() {
      try {
        setError(null);
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch pending purchase if it exists
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('property_purchases')
          .select(`
            id,
            property_id,
            status,
            property:properties (
              title
            )
          `)
          .eq('user_id', user.id)
          .not('status', 'in', ['completed', 'cancelled'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!purchaseError && purchaseData) {
          setPendingPurchase(purchaseData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Une erreur est survenue lors de la récupération de vos informations.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, navigate]);

  const getCompletionStatus = () => {
    if (!profile) return 0;

    const requiredFields = [
      'first_name',
      'last_name',
      'country',
      'phone',
      'professional_activity',
      'revenue_range'
    ];

    const completedFields = requiredFields.filter(field => Boolean(profile[field as keyof UserProfile]));
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      'ML': 'Mali',
      'SN': 'Sénégal',
      'CI': "Côte d'Ivoire",
      'FR': 'France',
      'BE': 'Belgique',
      'DE': 'Allemagne'
    };
    return countries[code] || code;
  };

  const getKycStatusDisplay = () => {
    if (profile?.kyc_verified === true) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        text: "Vérification complétée",
        className: "text-green-600"
      };
    } else if (profile?.kyc_verified === false) {
      return {
        icon: <Clock className="h-4 w-4 text-amber-600" />,
        text: "Vérification en cours",
        className: "text-amber-600"
      };
    }
    return {
      icon: null,
      text: "Vérification non commencée",
      className: "text-gray-600"
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const completionStatus = getCompletionStatus();
  const kycStatus = getKycStatusDisplay();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>{error}</p>
        </div>
      )}

      {/* Pending Purchase Banner */}
      {pendingPurchase && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-blue-900">
                Achat en cours : {pendingPurchase.property.title}
              </h2>
              <p className="mt-1 text-sm text-blue-700">
                Statut : {
                  pendingPurchase.status === 'pending_kyc' ? 'En attente de vérification KYC' :
                  pendingPurchase.status === 'pending_documents' ? 'Documents à fournir' :
                  pendingPurchase.status === 'pending_payment' ? 'En attente de paiement' :
                  'En cours de traitement'
                }
              </p>
            </div>
            <button
              onClick={() => navigate(`/purchases/${pendingPurchase.id}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Continuer l'achat
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Profile Completion Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Complétude du Profil
          </h2>
          <span className="text-2xl font-bold text-blue-600">
            {completionStatus}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionStatus}%` }}
          ></div>
        </div>

        {completionStatus < 100 && (
          <div className="mt-4 flex items-start space-x-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Profil incomplet</p>
              <p>Complétez votre profil pour pouvoir finaliser l'achat d'un bien.</p>
              <button
                onClick={() => navigate('/purchase/personal')}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Compléter mon profil →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Informations Personnelles
          </h2>
          <button
            onClick={() => navigate('/purchase/personal')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Nom</label>
            <p className="mt-1 text-lg">
              {profile?.last_name || <span className="text-gray-400">Non renseigné</span>}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Prénom</label>
            <p className="mt-1 text-lg">
              {profile?.first_name || <span className="text-gray-400">Non renseigné</span>}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Pays de Résidence</label>
            <p className="mt-1 text-lg">
              {profile?.country ? getCountryName(profile.country) : <span className="text-gray-400">Non renseigné</span>}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Téléphone</label>
            <p className="mt-1 text-lg">
              {profile?.phone || <span className="text-gray-400">Non renseigné</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Informations Professionnelles
          </h2>
          <button
            onClick={() => navigate('/purchase/professional')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Activité Professionnelle</label>
            <p className="mt-1 text-lg">
              {profile?.professional_activity || <span className="text-gray-400">Non renseigné</span>}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Tranche de Revenus</label>
            <p className="mt-1 text-lg">
              {profile?.revenue_range || <span className="text-gray-400">Non renseigné</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Statut des Vérifications
        </h2>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <User className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <p className="font-medium">Identité</p>
              <div className="flex items-center space-x-2 mt-1">
                {kycStatus.icon}
                <span className={kycStatus.className}>{kycStatus.text}</span>
              </div>
              {profile?.kyc_verified === null && (
                <button
                  onClick={() => navigate('/purchase/kyc')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Lancer la vérification →
                </button>
              )}
              {profile?.kyc_verified === true && (
                <button
                  onClick={() => navigate('/purchases')}
                  className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Continuer vers mes achats
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {profile?.phone?.startsWith('+33') || profile?.phone?.startsWith('+32') || profile?.phone?.startsWith('+49') ? (
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Résidence Européenne</p>
                <p className="text-sm text-gray-600">
                  {profile.has_eu_residency === true ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Titre de séjour ou carte d'identité UE validé
                    </span>
                  ) : profile.has_eu_residency === false ? (
                    <span className="text-amber-600">
                      Non applicable - Pas de titre de séjour UE
                    </span>
                  ) : (
                    <span className="text-gray-600">
                      Statut non vérifié
                    </span>
                  )}
                </p>
                {profile.has_eu_residency === null && (
                  <button
                    onClick={() => navigate('/purchase/residency')}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Vérifier le statut →
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
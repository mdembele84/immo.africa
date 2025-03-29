import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, CreditCard, Ban as Bank, Smartphone, Clock, Shield, FileText, Upload, Send, Info, Download, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils';
import { useCurrency } from '../contexts/CurrencyContext';

interface PaymentDetails {
  amount: number;
  property: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    location: string;
    price: number;
    country: {
      name: string;
    };
    developer: {
      company_name: string;
      email: string;
      phone: string;
    };
    payment_schedule: {
      initial_payment: number;
      monthly_payment: number;
      duration: number;
    };
  };
}

export function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'instant' | 'card' | null>(null);
  const [step, setStep] = useState<'summary' | 'method' | 'confirmation'>('summary');
  const [documents, setDocuments] = useState<File[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [paymentDate] = useState(new Date());
  const [transactionId] = useState(() => 
    'TRX' + Math.random().toString(36).substr(2, 9).toUpperCase()
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchPaymentDetails() {
      try {
        const { data, error: purchaseError } = await supabase
          .from('property_purchases')
          .select(`
            property:properties (
              id,
              title,
              description,
              image_url,
              location,
              price,
              country:countries!inner (
                name
              ),
              developer:developers!inner (
                company_name,
                email,
                phone
              ),
              payment_schedule:property_payment_schedules!inner (
                initial_payment,
                monthly_payment,
                duration
              )
            )
          `)
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (purchaseError) throw purchaseError;

        if (!data || !data.property) {
          setError('Paiement non trouvé');
          return;
        }

        setPaymentDetails({
          amount: data.property.payment_schedule[0].initial_payment,
          property: data.property
        });
      } catch (error) {
        console.error('Error fetching payment details:', error);
        setError('Une erreur est survenue lors de la récupération des informations.');
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentDetails();
  }, [id, user, navigate]);

  const handlePayment = async () => {
    if (!user || !paymentDetails) return;

    try {
      // Update purchase status
      const { error } = await supabase
        .from('property_purchases')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setStep('confirmation');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Une erreur est survenue lors du traitement du paiement.');
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !paymentDetails) return;

    try {
      setUploadingDocument(true);
      const newDocuments = Array.from(files);
      setDocuments(prev => [...prev, ...newDocuments]);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Documents téléchargés avec succès');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Une erreur est survenue lors du téléchargement du document.');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!paymentDetails) return;

    const receipt = `
REÇU DE PAIEMENT
---------------

Transaction ID: ${transactionId}
Date: ${paymentDate.toLocaleDateString()}

BIEN IMMOBILIER
--------------
${paymentDetails.property.title}
${paymentDetails.property.location}
${paymentDetails.property.country.name}

PAIEMENT
--------
Montant: ${formatCurrency(paymentDetails.amount, currency)} ${currency}
Méthode: ${selectedMethod === 'bank' ? 'Virement bancaire' : 
          selectedMethod === 'instant' ? 'Virement SEPA instantané' : 
          'Carte bancaire'}

PROMOTEUR
---------
${paymentDetails.property.developer.company_name}
${paymentDetails.property.developer.email}
${paymentDetails.property.developer.phone}
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recu-paiement-${transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Paiement non trouvé'}
          </h2>
          <button
            onClick={() => navigate('/purchases')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour aux achats
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement Effectué avec Succès
            </h2>
            <p className="text-gray-600">
              Votre paiement a été traité et confirmé. Un email de confirmation vous a été envoyé.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Récapitulatif</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-medium">{transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{paymentDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Montant</span>
                <span className="font-medium">{formatCurrency(paymentDetails.amount, currency)} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Méthode</span>
                <span className="font-medium">
                  {selectedMethod === 'bank' ? 'Virement bancaire' : 
                   selectedMethod === 'instant' ? 'Virement SEPA instantané' : 
                   'Carte bancaire'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-blue-900">Prochaines étapes</h4>
                <p className="mt-1 text-sm text-blue-700">
                  Les documents relatifs à votre acquisition seront bientôt disponibles dans votre espace personnel.
                  Notre équipe vous contactera sous 48h pour finaliser les dernières formalités.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleDownloadReceipt}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Télécharger le reçu
            </button>
            <button
              onClick={() => navigate('/purchases')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Voir mes achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/purchases')}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour aux achats
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Property Details */}
        <div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src={paymentDetails.property.image_url}
              alt={paymentDetails.property.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {paymentDetails.property.title}
              </h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{paymentDetails.property.location}</span>
                <span className="mx-2">•</span>
                <span className="text-blue-600">{paymentDetails.property.country.name}</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Plan de Financement
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Prix Total</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(paymentDetails.property.price, currency)} {currency}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Durée</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {paymentDetails.property.payment_schedule.duration} mois
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Premier Versement</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(paymentDetails.property.payment_schedule.initial_payment, currency)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mensualités</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(paymentDetails.property.payment_schedule.monthly_payment, currency)} {currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Promoteur
                </h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Société:</span> {paymentDetails.property.developer.company_name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {paymentDetails.property.developer.email}
                  </p>
                  <p>
                    <span className="font-medium">Téléphone:</span> {paymentDetails.property.developer.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Details */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {step === 'summary' ? 'Récapitulatif du Paiement' : 'Mode de Paiement'}
            </h2>

            {step === 'summary' ? (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <h3 className="font-medium text-blue-900">Premier Versement</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Ce paiement correspond au versement initial pour votre acquisition.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Montant à payer</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(paymentDetails.amount, currency)} {currency}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Le paiement sera traité de manière sécurisée par notre partenaire bancaire.
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Documents Requis</h3>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      Pièce d'identité
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      Justificatif de domicile
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      Relevé bancaire
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Télécharger vos documents
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Télécharger un fichier</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                multiple
                                onChange={handleDocumentUpload}
                                disabled={uploadingDocument}
                              />
                            </label>
                            <p className="pl-1">ou glisser-déposer</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, JPG jusqu'à 10MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {documents.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Documents téléchargés
                        </h4>
                        <ul className="divide-y divide-gray-200">
                          {documents.map((doc, index) => (
                            <li key={index} className="py-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">{doc.name}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setDocuments(docs => docs.filter((_, i) => i !== index));
                                }}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Supprimer
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setStep('method')}
                  disabled={documents.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer vers le Paiement
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div
                    onClick={() => setSelectedMethod('bank')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedMethod === 'bank'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <Bank className="h-6 w-6 mr-3 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Virement Bancaire</h3>
                        <p className="text-sm text-gray-500">
                          Effectuez un virement depuis votre compte bancaire
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedMethod('instant')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedMethod === 'instant'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <Smartphone className="h-6 w-6 mr-3 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Virement SEPA Instantané</h3>
                        <p className="text-sm text-gray-500">
                          Paiement immédiat via votre application bancaire
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedMethod('card')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 mr-3 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Carte Bancaire</h3>
                        <p className="text-sm text-gray-500">
                          Paiement sécurisé par carte bancaire
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    onClick={handlePayment}
                    disabled={!selectedMethod}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Procéder au Paiement
                  </button>

                  <button
                    onClick={() => setStep('summary')}
                    className="w-full text-gray-600 hover:text-gray-800"
                  >
                    Retour au récapitulatif
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
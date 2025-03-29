import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MessageSquare, Clock, CheckCircle2, AlertTriangle, XCircle, Send, ArrowLeft, MapPin, Calendar, CreditCard, Upload, FileText, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils';
import { useCurrency } from '../contexts/CurrencyContext';

interface Purchase {
  id: string;
  status: 'pending_kyc' | 'pending_documents' | 'pending_payment' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  property: {
    id: string;
    title: string;
    image_url: string;
    price: number;
    location: string;
    country: {
      name: string;
    };
    developer: {
      id: string;
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
  messages: {
    id: string;
    message: string;
    created_at: string;
    user_id: string;
  }[];
  loan_application?: {
    status: 'pending' | 'approved' | 'rejected';
    documents: {
      id: string;
      name: string;
      url: string;
    }[];
  };
}

const STATUS_CONFIG = {
  pending_kyc: {
    label: 'En attente de vérification KYC',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-100'
  },
  pending_documents: {
    label: 'Documents à fournir',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-100'
  },
  pending_payment: {
    label: 'En attente de paiement',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-100'
  },
  processing: {
    label: 'En cours de traitement',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  completed: {
    label: 'Achat finalisé',
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  cancelled: {
    label: 'Annulé',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-100'
  }
};

export function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'direct' | 'loan' | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchPurchase() {
      try {
        const { data, error: purchaseError } = await supabase
          .from('property_purchases')
          .select(`
            *,
            property:properties (
              id,
              title,
              image_url,
              price,
              location,
              country:countries (
                name
              ),
              developer:developers (
                id,
                company_name,
                email,
                phone
              ),
              payment_schedule:property_payment_schedules (
                initial_payment,
                monthly_payment,
                duration
              )
            ),
            messages:purchase_messages (
              id,
              message,
              created_at,
              user_id
            )
          `)
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (purchaseError) throw purchaseError;

        if (!data) {
          setError('Achat non trouvé');
          return;
        }

        setPurchase(data);
      } catch (error) {
        console.error('Error fetching purchase:', error);
        setError('Une erreur est survenue lors de la récupération des informations.');
      } finally {
        setLoading(false);
      }
    }

    fetchPurchase();
  }, [id, user, navigate]);

  const handleSendMessage = async () => {
    if (!user || !purchase || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const { error } = await supabase
        .from('purchase_messages')
        .insert({
          purchase_id: purchase.id,
          user_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setPurchase(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: crypto.randomUUID(),
              message: newMessage.trim(),
              created_at: new Date().toISOString(),
              user_id: user.id
            }
          ]
        };
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Une erreur est survenue lors de l\'envoi du message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!purchase) return;
    navigate(`/payment/${purchase.id}`);
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !purchase) return;

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

  const handleLoanSubmission = async () => {
    if (!purchase || documents.length === 0) return;

    try {
      const { error } = await supabase
        .from('property_purchases')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString(),
          loan_application: {
            status: 'pending',
            documents: documents.map(doc => ({
              id: crypto.randomUUID(),
              name: doc.name,
              url: '#'
            }))
          }
        })
        .eq('id', purchase.id);

      if (error) throw error;

      setPurchase(prev => prev ? {
        ...prev,
        status: 'processing',
        loan_application: {
          status: 'pending',
          documents: documents.map(doc => ({
            id: crypto.randomUUID(),
            name: doc.name,
            url: '#'
          }))
        }
      } : null);

      alert('Votre demande de prêt a été soumise avec succès. La banque vous contactera prochainement.');
    } catch (error) {
      console.error('Error submitting loan application:', error);
      alert('Une erreur est survenue lors de la soumission de votre demande de prêt.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Achat non trouvé'}
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

  const statusConfig = STATUS_CONFIG[purchase.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/purchases')}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour aux achats
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src={purchase.property.image_url}
              alt={purchase.property.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {purchase.property.title}
                </h1>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusConfig.label}
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{purchase.property.location}</span>
                <span className="mx-2">•</span>
                <span className="text-blue-600">{purchase.property.country.name}</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Plan de Financement
                </h2>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center text-blue-900">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="font-medium">Durée du financement :</span>
                    <span className="ml-2">{purchase.property.payment_schedule.duration} mois</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Prix Total</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(purchase.property.price, currency)} {currency}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Premier Versement</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(purchase.property.payment_schedule.initial_payment, currency)} {currency}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Mensualité</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(purchase.property.payment_schedule.monthly_payment, currency)} {currency}
                    </div>
                  </div>
                </div>

                {purchase.status === 'pending_payment' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Options de Paiement</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="direct-payment"
                            name="payment-method"
                            checked={selectedPaymentMethod === 'direct'}
                            onChange={() => setSelectedPaymentMethod('direct')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="direct-payment" className="ml-3">
                            <div className="text-gray-900 font-medium">Paiement Direct</div>
                            <div className="text-gray-500 text-sm">
                              Effectuez le premier versement directement au promoteur
                            </div>
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="loan-payment"
                            name="payment-method"
                            checked={selectedPaymentMethod === 'loan'}
                            onChange={() => setSelectedPaymentMethod('loan')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="loan-payment" className="ml-3">
                            <div className="text-gray-900 font-medium">Demande de Prêt BMS</div>
                            <div className="text-gray-500 text-sm">
                              Faites une demande de prêt auprès de notre partenaire bancaire
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {selectedPaymentMethod === 'direct' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          Paiement Direct au Promoteur
                        </h4>
                        <p className="text-gray-600 mb-6">
                          En choisissant cette option, vous serez redirigé vers notre plateforme de paiement sécurisée
                          pour effectuer le versement initial de {formatCurrency(purchase.property.payment_schedule.initial_payment, currency)} {currency}.
                        </p>
                        <button
                          onClick={handleDirectPayment}
                          className="w-full flex justify-center items-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <CreditCard className="h-5 w-5 mr-2" />
                          Procéder au Paiement
                        </button>
                      </div>
                    )}

                    {selectedPaymentMethod === 'loan' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          Demande de Prêt BMS
                        </h4>
                        
                        <div className="space-y-4">
                          <p className="text-gray-600">
                            Documents requis pour l'étude de votre dossier :
                          </p>
                          
                          <ul className="space-y-2">
                            <li className="flex items-center text-gray-600">
                              <FileText className="h-4 w-4 mr-2" />
                              Justificatifs de revenus des 3 derniers mois
                            </li>
                            <li className="flex items-center text-gray-600">
                              <FileText className="h-4 w-4 mr-2" />
                              Relevés bancaires des 6 derniers mois
                            </li>
                            <li className="flex items-center text-gray-600">
                              <FileText className="h-4 w-4 mr-2" />
                              Justificatif de domicile
                            </li>
                            <li className="flex items-center text-gray-600">
                              <FileText className="h-4 w-4 mr-2" />
                              Pièce d'identité
                            </li>
                          </ul>

                          <div className="mt-6">
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
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                Documents téléchargés
                              </h5>
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

                          <button
                            onClick={handleLoanSubmission}
                            disabled={documents.length === 0}
                            className="w-full flex justify-center items-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                          >
                            <Send className="h-5 w-5 mr-2" />
                            Soumettre la demande de prêt
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Promoteur
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Société:</span> {purchase.property.developer.company_name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {purchase.property.developer.email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Téléphone:</span> {purchase.property.developer.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Messages
            </h2>

            <div className="h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4">
                {purchase.messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun message pour le moment
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchase.messages.map(message => (
                      <div key={message.id} className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          message.user_id === user.id ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center mt-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 rounded-l-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
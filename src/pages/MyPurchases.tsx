import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MessageSquare, Clock, CheckCircle2, AlertTriangle, XCircle, Send, ArrowRight, Trash2 } from 'lucide-react';
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

export function MyPurchases() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [deletingPurchase, setDeletingPurchase] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchPurchases() {
      try {
        setError(null);
        const { data, error: purchasesError } = await supabase
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
                company_name
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (purchasesError) throw purchasesError;

        setPurchases(data || []);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        setError('Une erreur est survenue lors de la récupération de vos achats.');
      } finally {
        setLoading(false);
      }
    }

    fetchPurchases();
  }, [user, navigate]);

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

      setPurchases(prev => {
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

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
      return;
    }

    try {
      setDeletingPurchase(purchaseId);

      // Delete all messages first
      const { error: messagesError } = await supabase
        .from('purchase_messages')
        .delete()
        .eq('purchase_id', purchaseId);

      if (messagesError) throw messagesError;

      // Then delete the purchase
      const { error: purchaseError } = await supabase
        .from('property_purchases')
        .delete()
        .eq('id', purchaseId)
        .eq('user_id', user?.id);

      if (purchaseError) throw purchaseError;

      // Update local state
      setPurchases(prev => prev.filter(p => p.id !== purchaseId));
      setSelectedPurchase(null);

    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Une erreur est survenue lors de la suppression de l\'achat.');
    } finally {
      setDeletingPurchase(null);
    }
  };

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Achats</h1>
        <button
          onClick={() => navigate('/properties')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Building2 className="h-5 w-5 mr-2" />
          Voir les biens disponibles
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>{error}</p>
        </div>
      )}

      {purchases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun achat en cours</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par explorer nos biens disponibles.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/properties')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Voir les biens disponibles
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map(purchase => {
            const statusConfig = STATUS_CONFIG[purchase.status];
            const StatusIcon = statusConfig.icon;
            const canDelete = ['pending_kyc', 'pending_documents', 'pending_payment'].includes(purchase.status);

            return (
              <div key={purchase.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <img
                        src={purchase.property.image_url || 'https://via.placeholder.com/200'}
                        alt={purchase.property.title}
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 truncate">
                          {purchase.property.title}
                        </h2>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusConfig.label}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {purchase.property.location} • {purchase.property.country.name}
                      </div>
                      {purchase.property.developer && (
                        <div className="mt-2 flex items-center text-gray-600">
                          <Building2 className="h-4 w-4 mr-2" />
                          <span className="text-sm">{purchase.property.developer.company_name}</span>
                        </div>
                      )}
                      <div className="mt-2 text-lg font-medium text-gray-900">
                        {formatCurrency(purchase.property.price, currency)} {currency}
                      </div>

                      <div className="mt-4 flex items-center space-x-4">
                        <button
                          onClick={() => navigate(`/purchases/${purchase.id}`)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Voir les détails
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>

                        {canDelete && (
                          <button
                            onClick={() => handleDeletePurchase(purchase.id)}
                            disabled={deletingPurchase === purchase.id}
                            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingPurchase === purchase.id ? 'Suppression...' : 'Supprimer'}
                          </button>
                        )}
                      </div>

                      {/* Messages Section */}
                      <div className="mt-4">
                        <button
                          onClick={() => setSelectedPurchase(selectedPurchase === purchase.id ? null : purchase.id)}
                          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {purchase.messages.length} messages
                        </button>

                        {selectedPurchase === purchase.id && (
                          <div className="mt-4">
                            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                              {purchase.messages.map(message => (
                                <div key={message.id} className="mb-4">
                                  <div className="flex items-start">
                                    <div className={`flex-1 ${message.user_id === user?.id ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}>
                                      <div className={`rounded-lg p-3 ${message.user_id === user?.id ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}>
                                        <p className="text-sm">{message.message}</p>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(message.created_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 flex items-center">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Votre message..."
                                className="flex-1 rounded-l-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button
                                onClick={() => handleSendMessage(purchase.id)}
                                disabled={sendingMessage || !newMessage.trim()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
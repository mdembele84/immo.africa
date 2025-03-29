import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);

      if (mode === 'signup') {
        // Déconnexion de toute session existante
        await supabase.auth.signOut();

        // Inscription avec email et mot de passe
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              email_confirm: true
            }
          }
        });

        if (error) throw error;

        // Vérifier si l'email est déjà utilisé
        if (data?.user?.identities?.length === 0) {
          throw new Error('Cet email est déjà utilisé');
        }

        // Envoyer l'OTP
        const { error: otpError } = await supabase.auth.resend({
          type: 'signup',
          email
        });

        if (otpError) throw otpError;

        toast.success('Un code de vérification a été envoyé à votre adresse email');
        navigate('/login');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        onClose();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {mode === 'login' ? 'Connectez-vous' : 'Créez votre compte'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {mode === 'login' ? 'Connexion...' : 'Inscription...'}
                </div>
              ) : mode === 'login' ? (
                'Se connecter'
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {mode === 'login' ? 'Nouveau sur immo.africa ?' : 'Déjà inscrit ?'}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {mode === 'login' ? "S'inscrire" : 'Se connecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
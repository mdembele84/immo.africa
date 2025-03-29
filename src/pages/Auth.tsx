import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'react-hot-toast';
import { EmailVerification } from '../components/EmailVerification';

export function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);

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
      setMode('verify');
    } catch (error: any) {
      console.error('Error during sign up:', error);
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      navigate('/properties');
    } catch (error: any) {
      console.error('Error during login:', error);
      toast.error(error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = () => {
    navigate('/properties');
  };

  if (mode === 'verify') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <EmailVerification 
              email={email}
              onVerified={handleVerified}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building2 className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'login' ? 'Connectez-vous' : 'Créez votre compte'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          La première plateforme immobilière en Afrique de l'Ouest
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
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
            </div>
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
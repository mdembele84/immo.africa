import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Mail, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) {
        setAttempts(a => a + 1);
        throw error;
      }

      toast.success('Email vérifié avec succès');
      onVerified();
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Code de vérification incorrect');
      
      if (attempts >= 2) {
        toast.error('Trop de tentatives. Veuillez demander un nouveau code.');
        setCountdown(30);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;

      toast.success('Nouveau code envoyé');
      setCountdown(60);
      setAttempts(0);
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error("Erreur lors de l'envoi du code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
        <Mail className="w-6 h-6 text-blue-600" />
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Nous avons envoyé un code de vérification à
          <br />
          <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="otp" className="sr-only">
            Code de vérification
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Entrez le code de vérification"
            className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            maxLength={6}
            disabled={loading || countdown > 0}
          />
        </div>

        {attempts > 0 && (
          <div className="flex items-start p-4 bg-yellow-50 rounded-md">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <p className="ml-3 text-sm text-yellow-700">
              Code incorrect. Il vous reste {3 - attempts} tentative(s).
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !otp.trim() || countdown > 0}
          className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (loading || countdown > 0) ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Vérification...' : 'Vérifier'}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={handleResendOtp}
          disabled={resendLoading || countdown > 0}
          className={`flex items-center justify-center w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 ${
            (resendLoading || countdown > 0) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
          {countdown > 0
            ? `Réessayer dans ${countdown}s`
            : resendLoading
            ? 'Envoi en cours...'
            : 'Renvoyer le code'}
        </button>
      </div>
    </div>
  );
}
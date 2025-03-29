import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface LoanConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoanConditionsModal({ isOpen, onClose }: LoanConditionsModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Conditions de Financement BMS</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Critères d'Éligibilité</h3>
              <ul className="space-y-2">
                {[
                  'Être âgé de 21 à 65 ans',
                  'Avoir un revenu régulier',
                  'Être domicilié dans un pays de la zone UEMOA',
                  'Justifier d\'une situation professionnelle stable',
                  'Avoir une assurance emprunteur'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Conditions de Financement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Taux d'Intérêt</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Taux fixe : à partir de 6.5%</li>
                    <li>• Taux variable : BMS + 3%</li>
                    <li>• Possibilité de taux bonifié</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Durée du Prêt</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Minimum : 5 ans</li>
                    <li>• Maximum : 25 ans</li>
                    <li>• Différé possible jusqu'à 24 mois</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents Requis</h3>
              <ul className="space-y-2">
                {[
                  'Pièce d\'identité en cours de validité',
                  'Justificatifs de revenus des 3 derniers mois',
                  'Relevés bancaires des 6 derniers mois',
                  'Justificatif de domicile',
                  'Plan de financement détaillé'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Note : Les conditions présentées sont indicatives et peuvent varier selon votre profil et le montant du financement. Consultez votre conseiller pour une offre personnalisée.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
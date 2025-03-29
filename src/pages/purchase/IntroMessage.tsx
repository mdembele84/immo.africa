import React from 'react';
import { Building2, Ban as Bank } from 'lucide-react';

export function IntroMessage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Pourquoi avons-nous besoin de ces informations ?
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Building2 className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Promoteur Immobilier</h3>
            <p className="mt-1 text-sm text-gray-600">
              Ces informations permettront au promoteur d'établir votre dossier d'acquisition 
              et de préparer les documents nécessaires.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Bank className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Banque BMS</h3>
            <p className="mt-1 text-sm text-gray-600">
              Ces informations faciliteront l'étude préliminaire de votre dossier de financement 
              et accéléreront le processus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
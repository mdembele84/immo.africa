import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

export function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Devise:</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as 'CFA' | 'EUR')}
        className="border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="CFA">CFA</option>
        <option value="EUR">EUR</option>
      </select>
    </div>
  );
}
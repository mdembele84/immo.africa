import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 text-white mb-4">
              <Building2 className="h-8 w-8" />
              <span className="text-xl font-bold">immo.africa</span>
            </div>
            <p className="text-sm">
              Votre partenaire de confiance pour l'investissement immobilier en Afrique de l'Ouest.
            </p>
            <div className="mt-4 space-y-2">
              <a href="mailto:contact@immo.africa" className="flex items-center text-sm hover:text-white">
                <Mail className="h-4 w-4 mr-2" />
                contact@immo.africa
              </a>
              <a href="tel:+22320000000" className="flex items-center text-sm hover:text-white">
                <Phone className="h-4 w-4 mr-2" />
                +223 20 00 00 00
              </a>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2" />
                Bamako, Mali
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/properties?type=house" className="hover:text-white">
                  Maisons
                </Link>
              </li>
              <li>
                <Link to="/properties?type=land" className="hover:text-white">
                  Terrains
                </Link>
              </li>
              <li>
                <Link to="/developers" className="hover:text-white">
                  Promoteurs
                </Link>
              </li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h3 className="text-white font-semibold mb-4">Pays</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/properties?country=ML" className="hover:text-white">
                  Mali
                </Link>
              </li>
              <li>
                <Link to="/properties?country=SN" className="hover:text-white">
                  Sénégal
                </Link>
              </li>
              <li>
                <Link to="/properties?country=CI" className="hover:text-white">
                  Côte d'Ivoire
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informations Légales</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="hover:text-white">
                  Conditions Générales
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-white">
                  Mentions Légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} immo.africa. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
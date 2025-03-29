import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Home, LogOut, ShoppingBag, Users, Heart, ChevronDown } from 'lucide-react';
import { CurrencySwitch } from './CurrencySwitch';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">immo.africa</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <CurrencySwitch />
          <Link
            to="/properties?type=land"
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            <Building2 className="h-4 w-4" />
            <span>Terrains</span>
          </Link>
          <Link
            to="/properties?type=house"
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            <Home className="h-4 w-4" />
            <span>Maisons</span>
          </Link>
          <Link
            to="/developers"
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            <Users className="h-4 w-4" />
            <span>Promoteurs</span>
          </Link>
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <User className="h-4 w-4" />
                <span>Mon Compte</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mon Profil
                  </Link>
                  <Link
                    to="/purchases"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Mes Achats
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Mes Favoris
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <User className="h-4 w-4" />
              <span>Se connecter</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
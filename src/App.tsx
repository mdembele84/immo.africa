import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Properties } from './pages/Properties';
import { PropertyDetail } from './pages/PropertyDetail';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { MyPurchases } from './pages/MyPurchases';
import { PurchaseDetail } from './pages/PurchaseDetail';
import { Payment } from './pages/Payment';
import { Favorites } from './pages/Favorites';
import { Developers } from './pages/Developers';
import { DeveloperProfile } from './pages/DeveloperProfile';
import { PersonalInfo } from './pages/purchase/PersonalInfo';
import { ProfessionalInfo } from './pages/purchase/ProfessionalInfo';
import { ResidencyCheck } from './pages/purchase/ResidencyCheck';
import { KYC } from './pages/purchase/KYC';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/purchases" element={<MyPurchases />} />
                <Route path="/purchases/:id" element={<PurchaseDetail />} />
                <Route path="/payment/:id" element={<Payment />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/developers" element={<Developers />} />
                <Route path="/developer/:id" element={<DeveloperProfile />} />
                <Route path="/purchase/personal" element={<PersonalInfo />} />
                <Route path="/purchase/professional" element={<ProfessionalInfo />} />
                <Route path="/purchase/residency" element={<ResidencyCheck />} />
                <Route path="/purchase/kyc" element={<KYC />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}
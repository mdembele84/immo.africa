export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'land' | 'house';
  price: number;
  imageUrl: string;
  location: string;
  country: {
    code: string;
    name: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'sold';
  paymentSchedule: {
    initialPayment: number;
    monthlyPayment: number;
    duration: number;
  };
  details?: {
    surface: number;
    bedrooms: number;
    bathrooms: number;
    matterportId?: string;
    floorPlanUrl?: string;
  };
  requiredDocuments?: {
    name: string;
    description: string;
  }[];
  developer?: {
    id: string;
    company_name: string;
    logo_url: string;
    description: string;
    website: string;
    phone: string;
    email: string;
    total_reviews: number;
  };
}

export interface User {
  id: string;
  role: 'client' | 'developer' | 'agent';
  name: string;
  email: string;
}
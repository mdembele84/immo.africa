import { supabase } from './supabase';
import type { Property } from '../types';
import type { Database } from './database.types';

// Function to check for properties with missing details or payment schedules
export async function checkMissingData(): Promise<void> {
  try {
    // Check for properties missing details
    const { data: missingDetails, error: detailsError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        type,
        property_details(id)
      `)
      .is('property_details', null);
    
    if (detailsError) throw detailsError;
    
    // Check for properties missing payment schedules
    const { data: missingPayments, error: paymentsError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        type,
        property_payment_schedules(id)
      `)
      .is('property_payment_schedules', null);
    
    if (paymentsError) throw paymentsError;
  } catch (error) {
    console.error('Error checking for missing data:', error);
  }
}

type DbProperty = Database['public']['Tables']['properties']['Row'];
type DbPropertyPaymentSchedule = Database['public']['Tables']['property_payment_schedules']['Row'];
type DbPropertyDetails = Database['public']['Tables']['property_details']['Row'];
type DbRequiredDocument = Database['public']['Tables']['required_documents']['Row'];
type DbCountry = Database['public']['Tables']['countries']['Row'];

export async function fetchProperties(filters?: {
  type?: 'land' | 'house';
  countryCode?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}): Promise<Property[]> {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        countries (
          code,
          name
        ),
        property_payment_schedules (
          initial_payment,
          monthly_payment,
          duration
        ),
        property_details (
          surface,
          bedrooms,
          bathrooms,
          matterport_id,
          floor_plan_url
        ),
        required_documents (
          name,
          description
        ),
        developers (
          id,
          company_name,
          logo_url,
          description,
          website,
          phone,
          email,
          developer_reviews (
            count
          )
        )
      `);

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.countryCode) {
      query = query.eq('country_code', filters.countryCode);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(transformPropertyData);
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

export async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        countries (
          code,
          name
        ),
        property_payment_schedules (
          initial_payment,
          monthly_payment,
          duration
        ),
        property_details (
          surface,
          bedrooms,
          bathrooms,
          matterport_id,
          floor_plan_url
        ),
        required_documents (
          name,
          description
        ),
        developers (
          id,
          company_name,
          logo_url,
          description,
          website,
          phone,
          email,
          developer_reviews (
            count
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No data found
      throw error;
    }

    return transformPropertyData(data);
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
}

function transformPropertyData(data: any): Property {
  const coordinates = data.coordinates?.slice(1, -1).split(',').map(Number);
  const countryData = Array.isArray(data.countries) ? data.countries[0] : data.countries;
  
  // Default values for payment schedule if not available
  const defaultPaymentSchedule = {
    initialPayment: data.price * 0.2, // Default to 20% down payment
    monthlyPayment: data.price * 0.8 / 36, // Default to remaining 80% over 36 months
    duration: 36 // Default to 36 months
  };

  // Handle property_payment_schedules which might be null, empty array, or array with data
  let paymentData = null;
  if (Array.isArray(data.property_payment_schedules) && data.property_payment_schedules.length > 0) {
    paymentData = data.property_payment_schedules[0];
  } else if (data.payment_schedule) {
    paymentData = data.payment_schedule;
  }

  // Get payment schedule with fallbacks
  const paymentSchedule = {
    initialPayment: paymentData?.initial_payment || defaultPaymentSchedule.initialPayment,
    monthlyPayment: paymentData?.monthly_payment || defaultPaymentSchedule.monthlyPayment,
    duration: paymentData?.duration || defaultPaymentSchedule.duration
  };

  // Default values for property details if not available
  const defaultDetails = {
    surface: data.type === 'house' ? 200 : 500, // Default surface area based on property type
    bedrooms: data.type === 'house' ? 3 : null,
    bathrooms: data.type === 'house' ? 2 : null,
    matterportId: null,
    floorPlanUrl: null
  };

  // Get property details with fallbacks
  const details = data.property_details ? {
    surface: data.property_details.surface || defaultDetails.surface,
    bedrooms: data.property_details.bedrooms || defaultDetails.bedrooms,
    bathrooms: data.property_details.bathrooms || defaultDetails.bathrooms,
    // For houses, ensure we're getting the matterport_id and floor_plan_url values
    matterportId: data.type === 'house' ? (data.property_details.matterport_id || 'YpKmWx9vLs3') : null,
    floorPlanUrl: data.type === 'house' ? (data.property_details.floor_plan_url || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200') : null
  } : defaultDetails;

  const transformedProperty = {
    id: data.id,
    title: data.title,
    description: data.description || '',
    type: data.type,
    price: data.price,
    imageUrl: data.image_url || 'https://via.placeholder.com/800x600?text=No+Image',
    location: data.location,
    country: countryData ? {
      code: countryData.code,
      name: countryData.name
    } : {
      code: data.country_code,
      name: data.country_code // Fallback to code as name
    },
    coordinates: coordinates ? {
      lat: coordinates[1],
      lng: coordinates[0]
    } : { lat: 0, lng: 0 },
    status: data.status,
    paymentSchedule,
    details,
    requiredDocuments: (data.required_documents || []).map((doc: DbRequiredDocument) => ({
      name: doc.name,
      description: doc.description
    })),
    ...(data.developers?.[0] || data.developer ? {
      developer: {
        id: data.developers?.[0]?.id || data.developer?.id,
        company_name: data.developers?.[0]?.company_name || data.developer?.company_name,
        logo_url: data.developers?.[0]?.logo_url || data.developer?.logo_url,
        description: data.developers?.[0]?.description || data.developer?.description,
        website: data.developers?.[0]?.website || data.developer?.website,
        phone: data.developers?.[0]?.phone || data.developer?.phone,
        email: data.developers?.[0]?.email || data.developer?.email,
        total_reviews: data.developers?.[0]?.developer_reviews?.[0]?.count || data.developer?.developer_reviews?.[0]?.count || 0
      }
    } : undefined)
  };

  return transformedProperty;
}

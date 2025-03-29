import { supabase } from './lib/supabase';

async function checkMissingData() {
  console.log('Checking for properties with missing details or payment schedules...');
  
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
    
    console.log(`\nProperties missing details (${missingDetails.length}):`);
    missingDetails.forEach(p => {
      console.log(`- ${p.id}: ${p.title} (${p.type})`);
    });
    
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
    
    console.log(`\nProperties missing payment schedules (${missingPayments.length}):`);
    missingPayments.forEach(p => {
      console.log(`- ${p.id}: ${p.title} (${p.type})`);
    });
    
    // Summary
    console.log('\nSummary:');
    console.log(`- Total properties missing details: ${missingDetails.length}`);
    console.log(`- Total properties missing payment schedules: ${missingPayments.length}`);
    
    if (missingDetails.length === 0 && missingPayments.length === 0) {
      console.log('All properties have the required data!');
    } else {
      console.log('Some properties are missing required data. The changes to use LEFT JOIN will allow these properties to be returned in queries.');
    }
  } catch (error) {
    console.error('Error checking for missing data:', error);
  }
}

checkMissingData();

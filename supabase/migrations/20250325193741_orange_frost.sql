/*
  # Update KYC status management

  1. Changes
    - Set default value for kyc_verified to NULL to support three states:
      * NULL = 'not_started'
      * false = 'in_progress'
      * true = 'verified'
    - Update existing records to set kyc_verified to NULL (not_started)
*/

-- Remove default value and set existing records to NULL
ALTER TABLE user_profiles 
ALTER COLUMN kyc_verified DROP DEFAULT;

UPDATE user_profiles 
SET kyc_verified = NULL 
WHERE kyc_verified = false;
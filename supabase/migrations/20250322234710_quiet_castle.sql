/*
  # Add KYC verification status

  1. Changes
    - Add `kyc_verified` column to `user_profiles` table with default value of false
    - Add `kyc_verified_at` column to track when verification was completed
  
  2. Security
    - No changes to RLS policies needed
*/

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS kyc_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kyc_verified_at timestamptz;
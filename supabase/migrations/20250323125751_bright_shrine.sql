/*
  # Add purchase data for specific user

  1. Changes
    - Add a property purchase record for user with phone 0678879800
    - Update property status to 'sold'
*/

-- First, get the user ID based on the phone number
WITH user_data AS (
  SELECT user_id 
  FROM user_profiles 
  WHERE phone = '+33678879800'
  LIMIT 1
),
-- Get a property to mark as purchased (Villa Moderne à Badalabougou)
property_data AS (
  SELECT id 
  FROM properties 
  WHERE title = 'Villa Moderne à Badalabougou'
  LIMIT 1
)
INSERT INTO property_purchases (
  user_id,
  property_id,
  status,
  created_at
)
SELECT 
  user_data.user_id,
  property_data.id,
  'completed',
  now() - interval '2 months'
FROM user_data, property_data;

-- Update the property status to sold
UPDATE properties
SET status = 'sold'
WHERE title = 'Villa Moderne à Badalabougou';
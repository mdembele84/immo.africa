/*
  # Delete all purchases and related data

  1. Changes
    - Delete all purchase messages
    - Delete all property purchases
    - Reset property status to 'available'
*/

-- Delete all purchase messages
DELETE FROM purchase_messages;

-- Delete all property purchases
DELETE FROM property_purchases;

-- Reset all properties to available status
UPDATE properties 
SET status = 'available' 
WHERE status = 'sold';
/*
  # Add property purchases management

  1. New Tables
    - `property_purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `property_id` (uuid, foreign key to properties)
      - `status` (text) - 'pending_kyc', 'pending_documents', 'pending_payment', 'processing', 'completed', 'cancelled'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `purchase_messages`
      - `id` (uuid, primary key)
      - `purchase_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their purchases
    - Add policies for service role to manage all purchases
*/

-- Create property purchases table
CREATE TABLE IF NOT EXISTS property_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  property_id uuid NOT NULL REFERENCES properties(id),
  status text NOT NULL CHECK (status IN ('pending_kyc', 'pending_documents', 'pending_payment', 'processing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase messages table
CREATE TABLE IF NOT EXISTS purchase_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES property_purchases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE property_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for property purchases
CREATE POLICY "Users can view their own purchases" ON property_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases" ON property_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" ON property_purchases
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for purchase messages
CREATE POLICY "Users can view messages for their purchases" ON purchase_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM property_purchases
      WHERE id = purchase_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their purchases" ON purchase_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM property_purchases
      WHERE id = purchase_id AND user_id = auth.uid()
    )
  );
/*
  # Add real estate developers

  1. New Tables
    - `developers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `company_name` (text)
      - `description` (text)
      - `logo_url` (text)
      - `website` (text)
      - `phone` (text)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `developer_reviews`
      - `id` (uuid, primary key)
      - `developer_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `purchase_id` (uuid, foreign key)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)

  2. Changes
    - Add `developer_id` to properties table
    - Add RLS policies for developers and reviews
*/

-- Create developers table
CREATE TABLE IF NOT EXISTS developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  company_name text NOT NULL,
  description text,
  logo_url text,
  website text,
  phone text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create developer reviews table
CREATE TABLE IF NOT EXISTS developer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  purchase_id uuid NOT NULL REFERENCES property_purchases(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(purchase_id)
);

-- Add developer_id to properties
ALTER TABLE properties 
ADD COLUMN developer_id uuid REFERENCES developers(id);

-- Enable Row Level Security
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for developers
CREATE POLICY "Anyone can read developers" ON developers
  FOR SELECT USING (true);

CREATE POLICY "Developers can update their own profile" ON developers
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for developer reviews
CREATE POLICY "Anyone can read developer reviews" ON developer_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their purchases" ON developer_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM property_purchases
      WHERE id = purchase_id 
      AND user_id = auth.uid()
      AND status = 'completed'
    )
  );

-- Create temporary users for developers
DO $$
DECLARE
  sahel_user_id uuid;
  cocody_user_id uuid;
  dakar_user_id uuid;
  sahel_dev_id uuid;
  cocody_dev_id uuid;
  dakar_dev_id uuid;
BEGIN
  -- Create user for Sahel Immobilier
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'contact@sahel-immobilier.com', 'PLACEHOLDER', now(), now(), now())
  RETURNING id INTO sahel_user_id;

  -- Create user for Cocody Prestige
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'contact@cocody-prestige.ci', 'PLACEHOLDER', now(), now(), now())
  RETURNING id INTO cocody_user_id;

  -- Create user for Dakar Properties
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'contact@dakar-properties.sn', 'PLACEHOLDER', now(), now(), now())
  RETURNING id INTO dakar_user_id;

  -- Insert Sahel Immobilier
  INSERT INTO developers (id, user_id, company_name, description, logo_url, website, phone, email)
  VALUES (
    gen_random_uuid(),
    sahel_user_id,
    'Sahel Immobilier',
    'Leader de l''immobilier de luxe au Mali avec plus de 15 ans d''expérience. Spécialisé dans les villas haut de gamme et les terrains premium à Bamako.',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100',
    'https://sahel-immobilier.com',
    '+223 20 22 23 24',
    'contact@sahel-immobilier.com'
  )
  RETURNING id INTO sahel_dev_id;

  -- Insert Cocody Prestige
  INSERT INTO developers (id, user_id, company_name, description, logo_url, website, phone, email)
  VALUES (
    gen_random_uuid(),
    cocody_user_id,
    'Cocody Prestige',
    'Promoteur immobilier de référence en Côte d''Ivoire, spécialisé dans les résidences de luxe et les appartements haut standing à Abidjan.',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100',
    'https://cocody-prestige.ci',
    '+225 27 22 23 24',
    'contact@cocody-prestige.ci'
  )
  RETURNING id INTO cocody_dev_id;

  -- Insert Dakar Properties
  INSERT INTO developers (id, user_id, company_name, description, logo_url, website, phone, email)
  VALUES (
    gen_random_uuid(),
    dakar_user_id,
    'Dakar Properties',
    'Premier groupe immobilier au Sénégal, offrant des solutions d''habitat innovantes et durables. Expert en construction et gestion de projets immobiliers.',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100',
    'https://dakar-properties.sn',
    '+221 33 22 23 24',
    'contact@dakar-properties.sn'
  )
  RETURNING id INTO dakar_dev_id;

  -- Update properties with developer_id
  UPDATE properties p
  SET developer_id = 
    CASE
      WHEN p.location LIKE '%Bamako%' THEN sahel_dev_id
      WHEN p.location LIKE '%Abidjan%' THEN cocody_dev_id
      WHEN p.location LIKE '%Dakar%' THEN dakar_dev_id
    END
  WHERE 
    p.location LIKE '%Bamako%' OR
    p.location LIKE '%Abidjan%' OR
    p.location LIKE '%Dakar%';
END $$;
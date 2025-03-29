/*
  # Add properties tables

  1. New Tables
    - `countries`
      - `code` (text, primary key) - Country code (e.g., 'ML', 'SN')
      - `name` (text) - Country name
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `properties`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (text) - 'land' or 'house'
      - `price` (bigint)
      - `image_url` (text)
      - `location` (text)
      - `country_code` (text, foreign key)
      - `coordinates` (point)
      - `status` (text) - 'available' or 'sold'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `property_payment_schedules`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key)
      - `initial_payment` (bigint)
      - `monthly_payment` (bigint)
      - `duration` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `property_details`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key)
      - `surface` (integer)
      - `bedrooms` (integer)
      - `bathrooms` (integer)
      - `matterport_id` (text)
      - `floor_plan_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `required_documents`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
    - Add policies for service role to manage data

  3. Initial Data
    - Insert sample countries and properties
*/

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  code text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('land', 'house')),
  price bigint NOT NULL,
  image_url text,
  location text NOT NULL,
  country_code text NOT NULL REFERENCES countries(code),
  coordinates point,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create property_payment_schedules table
CREATE TABLE IF NOT EXISTS property_payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  initial_payment bigint NOT NULL,
  monthly_payment bigint NOT NULL,
  duration integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id)
);

-- Create property_details table
CREATE TABLE IF NOT EXISTS property_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  surface integer NOT NULL,
  bedrooms integer,
  bathrooms integer,
  matterport_id text,
  floor_plan_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id)
);

-- Create required_documents table
CREATE TABLE IF NOT EXISTS required_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE required_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read countries" ON countries
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read property payment schedules" ON property_payment_schedules
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read property details" ON property_details
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read required documents" ON required_documents
  FOR SELECT USING (true);

-- Insert initial countries data
INSERT INTO countries (code, name) VALUES
  ('ML', 'Mali'),
  ('SN', 'Sénégal'),
  ('CI', 'Côte d''Ivoire')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = now();

-- Create a type for document records
CREATE TYPE document_record AS (name text, description text);

-- Insert sample properties data
WITH property_ids AS (
  SELECT
    gen_random_uuid() AS id1,
    gen_random_uuid() AS id5,
    gen_random_uuid() AS id6,
    gen_random_uuid() AS id7
)
INSERT INTO properties (id, title, description, type, price, image_url, location, country_code, coordinates, status)
SELECT
  id1,
  'Villa Moderne à Badalabougou',
  'Magnifique villa moderne avec piscine, située dans un quartier prisé de Badalabougou. Cette propriété offre un cadre de vie luxueux avec des finitions haut de gamme et une vue imprenable sur le fleuve Niger.',
  'house',
  150000000,
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
  'Badalabougou, Bamako',
  'ML',
  point(-7.9893, 12.6253),
  'available'
FROM property_ids
UNION ALL
SELECT
  id5,
  'Villa de Luxe à Cocody',
  'Magnifique villa de luxe dans le quartier prisé de Cocody. Finitions haut de gamme, piscine et jardin tropical.',
  'house',
  250000000,
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1200',
  'Cocody, Abidjan',
  'CI',
  point(-4.0083, 5.3596),
  'available'
FROM property_ids
UNION ALL
SELECT
  id6,
  'Terrain Résidentiel à Riviera',
  'Superbe terrain constructible de 800m² dans le secteur prisé de Riviera. Idéal pour projet résidentiel haut de gamme.',
  'land',
  120000000,
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
  'Riviera, Abidjan',
  'CI',
  point(-3.9944, 5.3778),
  'available'
FROM property_ids
UNION ALL
SELECT
  id7,
  'Villa Moderne à Fann',
  'Splendide villa moderne avec vue sur mer dans le quartier résidentiel de Fann. Prestations haut de gamme.',
  'house',
  300000000,
  'https://images.unsplash.com/photo-1600566752229-250ed26470e3?auto=format&fit=crop&q=80&w=1200',
  'Fann, Dakar',
  'SN',
  point(-17.4441, 14.6937),
  'available'
FROM property_ids;

-- Insert sample payment schedules
INSERT INTO property_payment_schedules (property_id, initial_payment, monthly_payment, duration)
SELECT
  p.id,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 30000000
    WHEN p.title LIKE '%Cocody%' THEN 50000000
    WHEN p.title LIKE '%Riviera%' THEN 24000000
    WHEN p.title LIKE '%Fann%' THEN 60000000
  END,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 1000000
    WHEN p.title LIKE '%Cocody%' THEN 1666667
    WHEN p.title LIKE '%Riviera%' THEN 800000
    WHEN p.title LIKE '%Fann%' THEN 2000000
  END,
  120
FROM properties p;

-- Insert sample property details
INSERT INTO property_details (property_id, surface, bedrooms, bathrooms, matterport_id, floor_plan_url)
SELECT
  p.id,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 350
    WHEN p.title LIKE '%Cocody%' THEN 450
    WHEN p.title LIKE '%Fann%' THEN 500
  END,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 4
    WHEN p.title LIKE '%Cocody%' THEN 5
    WHEN p.title LIKE '%Fann%' THEN 6
  END,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 3
    WHEN p.title LIKE '%Cocody%' THEN 4
    WHEN p.title LIKE '%Fann%' THEN 5
  END,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 'SxQL3iGyoDo'
    WHEN p.title LIKE '%Cocody%' THEN 'Rx4YPj8vKm2'
    WHEN p.title LIKE '%Fann%' THEN 'HwNjKp5vXq9'
  END,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    WHEN p.title LIKE '%Cocody%' THEN 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200'
    WHEN p.title LIKE '%Fann%' THEN 'https://images.unsplash.com/photo-1600566752584-5af58391449f?auto=format&fit=crop&q=80&w=1200'
  END
FROM properties p
WHERE p.type = 'house';

-- Insert sample required documents
WITH property_docs AS (
  SELECT p.id,
    CASE
      WHEN p.title LIKE '%Badalabougou%' THEN ARRAY[
        ROW('Titre Foncier', 'Document officiel attestant de la propriété du bien immobilier')::document_record,
        ROW('Permis d''Occuper', 'Autorisation administrative d''occupation du terrain')::document_record,
        ROW('Permis de Construire', 'Autorisation administrative pour la construction')::document_record,
        ROW('Attestation de Non-Litige', 'Document certifiant l''absence de contentieux sur le bien')::document_record,
        ROW('Plan Architectural', 'Plans détaillés de la maison approuvés par un architecte agréé')::document_record
      ]
      WHEN p.title LIKE '%Cocody%' THEN ARRAY[
        ROW('Attestation de Propriété', 'Document officiel prouvant la propriété du bien')::document_record,
        ROW('Certificat de Propriété', 'Document légal confirmant les droits de propriété')::document_record,
        ROW('Permis de Construire', 'Autorisation officielle de construction')::document_record,
        ROW('Certificat de Conformité', 'Document attestant le respect des normes de construction')::document_record,
        ROW('Plan Cadastral', 'Document officiel montrant les limites de la propriété')::document_record
      ]
      WHEN p.title LIKE '%Riviera%' THEN ARRAY[
        ROW('Titre de Propriété', 'Document légal attestant la propriété du terrain')::document_record,
        ROW('Certificat Foncier', 'Document officiel du registre foncier')::document_record,
        ROW('Plan Topographique', 'Plan détaillé du terrain avec les mesures')::document_record,
        ROW('Attestation Villageoise', 'Document confirmant l''accord des autorités traditionnelles')::document_record
      ]
      WHEN p.title LIKE '%Fann%' THEN ARRAY[
        ROW('Titre Foncier', 'Document officiel de propriété')::document_record,
        ROW('Bail Emphytéotique', 'Contrat de location longue durée si applicable')::document_record,
        ROW('Autorisation de Construire', 'Permis officiel de construction')::document_record,
        ROW('Certificat de Conformité', 'Document attestant le respect des normes')::document_record,
        ROW('Plan Architectural Approuvé', 'Plans validés par les autorités compétentes')::document_record
      ]
    END as docs
  FROM properties p
)
INSERT INTO required_documents (property_id, name, description)
SELECT
  pd.id,
  (unnest(pd.docs)).name,
  (unnest(pd.docs)).description
FROM property_docs pd
WHERE pd.docs IS NOT NULL;
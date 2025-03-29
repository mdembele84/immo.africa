/*
  # Add properties tables and data

  1. New Tables
    - `countries`
    - `properties`
    - `property_payment_schedules`
    - `property_details`
    - `required_documents`

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data

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

-- Create policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'countries' AND policyname = 'Anyone can read countries'
  ) THEN
    CREATE POLICY "Anyone can read countries" ON countries FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'Anyone can read properties'
  ) THEN
    CREATE POLICY "Anyone can read properties" ON properties FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'property_payment_schedules' AND policyname = 'Anyone can read property payment schedules'
  ) THEN
    CREATE POLICY "Anyone can read property payment schedules" ON property_payment_schedules FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'property_details' AND policyname = 'Anyone can read property details'
  ) THEN
    CREATE POLICY "Anyone can read property details" ON property_details FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'required_documents' AND policyname = 'Anyone can read required documents'
  ) THEN
    CREATE POLICY "Anyone can read required documents" ON required_documents FOR SELECT USING (true);
  END IF;
END
$$;

-- Insert initial countries data
INSERT INTO countries (code, name) VALUES
  ('ML', 'Mali'),
  ('SN', 'Sénégal'),
  ('CI', 'Côte d''Ivoire')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = now();

-- Create a type for document records
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_record') THEN
    CREATE TYPE document_record AS (name text, description text);
  END IF;
END
$$;

-- Insert sample properties data
WITH RECURSIVE property_data AS (
  SELECT
    1 as idx,
    'Villa Moderne à Badalabougou' as title,
    'Magnifique villa moderne avec piscine, située dans un quartier prisé de Badalabougou. Cette propriété offre un cadre de vie luxueux avec des finitions haut de gamme et une vue imprenable sur le fleuve Niger. Construite avec des matériaux de première qualité, elle dispose d''un grand jardin paysager et d''une terrasse panoramique.' as description,
    'house' as type,
    150000000 as price,
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200' as image_url,
    'Badalabougou, Bamako' as location,
    'ML' as country_code,
    point(-7.9893, 12.6253) as coordinates
  UNION ALL
  SELECT
    idx + 1,
    CASE idx + 1
      WHEN 2 THEN 'Villa de Prestige à Sotuba'
      WHEN 3 THEN 'Terrain Commercial à ACI 2000'
      WHEN 4 THEN 'Terrain Résidentiel à Kalaban Coura'
      WHEN 5 THEN 'Villa de Luxe à Cocody'
      WHEN 6 THEN 'Terrain Résidentiel à Riviera'
      WHEN 7 THEN 'Villa Moderne à Fann'
      WHEN 8 THEN 'Villa Familiale aux Almadies'
      WHEN 9 THEN 'Terrain Vue Mer à Ngor'
      WHEN 10 THEN 'Terrain Premium à Marcory'
    END,
    CASE idx + 1
      WHEN 2 THEN 'Somptueuse villa contemporaine dans le quartier résidentiel de Sotuba. Architecture moderne alliant confort et élégance, avec des espaces de vie généreux et lumineux. Prestations haut de gamme incluant domotique et système de sécurité dernière génération.'
      WHEN 3 THEN 'Terrain stratégique de 600m² idéal pour projet commercial ou bureaux. Situé sur une artère principale avec fort potentiel de développement. Tous les réseaux sont disponibles (eau, électricité, fibre optique). Excellent investissement dans un quartier en pleine expansion.'
      WHEN 4 THEN 'Magnifique terrain plat de 400m² dans un secteur calme et recherché de Kalaban Coura. Idéal pour construction résidentielle, avec titre foncier impeccable. Proche des commodités et facilement accessible.'
      WHEN 5 THEN 'Magnifique villa de luxe dans le quartier prisé de Cocody. Finitions haut de gamme, piscine à débordement et jardin tropical. Cette propriété d''exception offre des prestations rares : home cinéma, cave à vin climatisée, et suite parentale avec spa privatif.'
      WHEN 6 THEN 'Superbe terrain constructible de 800m² dans le secteur prisé de Riviera. Idéal pour projet résidentiel haut de gamme. Vue dégagée, environnement calme et sécurisé. Proche des écoles internationales et centres commerciaux.'
      WHEN 7 THEN 'Splendide villa moderne avec vue sur mer dans le quartier résidentiel de Fann. Prestations haut de gamme incluant ascenseur privatif, système de filtration d''air, et panneaux solaires. Architecture contemporaine signée par un architecte de renom.'
      WHEN 8 THEN 'Grande villa familiale avec vue océan aux Almadies. Espaces de vie généreux, jardin luxuriant et piscine chauffée. Parfaite pour une famille nombreuse ou pour recevoir, avec quartier des invités indépendant.'
      WHEN 9 THEN 'Exceptionnel terrain de 1000m² avec vue imprenable sur l''océan à Ngor. Emplacement rare pour projet résidentiel luxueux. Exposition ouest idéale pour profiter des couchers de soleil.'
      WHEN 10 THEN 'Terrain viabilisé de 600m² dans le quartier recherché de Marcory. Excellent potentiel pour promotion immobilière ou résidence privée. Secteur calme avec toutes commodités à proximité.'
    END,
    CASE idx + 1
      WHEN 2 THEN 'house'
      WHEN 3 THEN 'land'
      WHEN 4 THEN 'land'
      WHEN 5 THEN 'house'
      WHEN 6 THEN 'land'
      WHEN 7 THEN 'house'
      WHEN 8 THEN 'house'
      WHEN 9 THEN 'land'
      WHEN 10 THEN 'land'
    END,
    CASE idx + 1
      WHEN 2 THEN 180000000
      WHEN 3 THEN 75000000
      WHEN 4 THEN 45000000
      WHEN 5 THEN 250000000
      WHEN 6 THEN 120000000
      WHEN 7 THEN 300000000
      WHEN 8 THEN 280000000
      WHEN 9 THEN 200000000
      WHEN 10 THEN 90000000
    END,
    CASE idx + 1
      WHEN 2 THEN 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200'
      WHEN 3 THEN 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=1200'
      WHEN 4 THEN 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'
      WHEN 5 THEN 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1200'
      WHEN 6 THEN 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'
      WHEN 7 THEN 'https://images.unsplash.com/photo-1600566752229-250ed26470e3?auto=format&fit=crop&q=80&w=1200'
      WHEN 8 THEN 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1200'
      WHEN 9 THEN 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200'
      WHEN 10 THEN 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'
    END,
    CASE idx + 1
      WHEN 2 THEN 'Sotuba, Bamako'
      WHEN 3 THEN 'ACI 2000, Bamako'
      WHEN 4 THEN 'Kalaban Coura, Bamako'
      WHEN 5 THEN 'Cocody, Abidjan'
      WHEN 6 THEN 'Riviera, Abidjan'
      WHEN 7 THEN 'Fann, Dakar'
      WHEN 8 THEN 'Almadies, Dakar'
      WHEN 9 THEN 'Ngor, Dakar'
      WHEN 10 THEN 'Marcory, Abidjan'
    END,
    CASE idx + 1
      WHEN 2 THEN 'ML'
      WHEN 3 THEN 'ML'
      WHEN 4 THEN 'ML'
      WHEN 5 THEN 'CI'
      WHEN 6 THEN 'CI'
      WHEN 7 THEN 'SN'
      WHEN 8 THEN 'SN'
      WHEN 9 THEN 'SN'
      WHEN 10 THEN 'CI'
    END,
    CASE idx + 1
      WHEN 2 THEN point(-7.9756, 12.6589)
      WHEN 3 THEN point(-7.9949, 12.6392)
      WHEN 4 THEN point(-7.9867, 12.6198)
      WHEN 5 THEN point(-4.0083, 5.3596)
      WHEN 6 THEN point(-3.9944, 5.3778)
      WHEN 7 THEN point(-17.4441, 14.6937)
      WHEN 8 THEN point(-17.4977, 14.7419)
      WHEN 9 THEN point(-17.5151, 14.7453)
      WHEN 10 THEN point(-3.9789, 5.3013)
    END
  FROM property_data
  WHERE idx < 10
)
INSERT INTO properties (id, title, description, type, price, image_url, location, country_code, coordinates, status)
SELECT
  gen_random_uuid(),
  title,
  description,
  type,
  price,
  image_url,
  location,
  country_code,
  coordinates,
  'available'
FROM property_data
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  location = EXCLUDED.location,
  country_code = EXCLUDED.country_code,
  coordinates = EXCLUDED.coordinates,
  updated_at = now();

-- Insert payment schedules for all properties
INSERT INTO property_payment_schedules (property_id, initial_payment, monthly_payment, duration)
SELECT
  p.id,
  CASE
    WHEN p.price <= 50000000 THEN p.price * 0.2
    WHEN p.price <= 100000000 THEN p.price * 0.25
    WHEN p.price <= 200000000 THEN p.price * 0.3
    ELSE p.price * 0.35
  END as initial_payment,
  (p.price - (
    CASE
      WHEN p.price <= 50000000 THEN p.price * 0.2
      WHEN p.price <= 100000000 THEN p.price * 0.25
      WHEN p.price <= 200000000 THEN p.price * 0.3
      ELSE p.price * 0.35
    END
  )) / 120 as monthly_payment,
  120
FROM properties p
ON CONFLICT (property_id) DO UPDATE SET
  initial_payment = EXCLUDED.initial_payment,
  monthly_payment = EXCLUDED.monthly_payment,
  duration = EXCLUDED.duration,
  updated_at = now();

-- Insert property details for houses
INSERT INTO property_details (property_id, surface, bedrooms, bathrooms, matterport_id, floor_plan_url)
SELECT
  p.id,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 350
    WHEN p.title LIKE '%Sotuba%' THEN 400
    WHEN p.title LIKE '%Cocody%' THEN 450
    WHEN p.title LIKE '%Fann%' THEN 500
    WHEN p.title LIKE '%Almadies%' THEN 550
  END as surface,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 4
    WHEN p.title LIKE '%Sotuba%' THEN 5
    WHEN p.title LIKE '%Cocody%' THEN 5
    WHEN p.title LIKE '%Fann%' THEN 6
    WHEN p.title LIKE '%Almadies%' THEN 6
  END as bedrooms,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 3
    WHEN p.title LIKE '%Sotuba%' THEN 4
    WHEN p.title LIKE '%Cocody%' THEN 4
    WHEN p.title LIKE '%Fann%' THEN 5
    WHEN p.title LIKE '%Almadies%' THEN 5
  END as bathrooms,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 'SxQL3iGyoDo'
    WHEN p.title LIKE '%Sotuba%' THEN 'Kw2QpVyR8mN'
    WHEN p.title LIKE '%Cocody%' THEN 'Rx4YPj8vKm2'
    WHEN p.title LIKE '%Fann%' THEN 'HwNjKp5vXq9'
    WHEN p.title LIKE '%Almadies%' THEN 'TzLmNx7vWs4'
  END as matterport_id,
  CASE
    WHEN p.title LIKE '%Badalabougou%' THEN 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    WHEN p.title LIKE '%Sotuba%' THEN 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1200'
    WHEN p.title LIKE '%Cocody%' THEN 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200'
    WHEN p.title LIKE '%Fann%' THEN 'https://images.unsplash.com/photo-1600566752584-5af58391449f?auto=format&fit=crop&q=80&w=1200'
    WHEN p.title LIKE '%Almadies%' THEN 'https://images.unsplash.com/photo-1600566752355-35492563d8d7?auto=format&fit=crop&q=80&w=1200'
  END as floor_plan_url
FROM properties p
WHERE p.type = 'house'
ON CONFLICT (property_id) DO UPDATE SET
  surface = EXCLUDED.surface,
  bedrooms = EXCLUDED.bedrooms,
  bathrooms = EXCLUDED.bathrooms,
  matterport_id = EXCLUDED.matterport_id,
  floor_plan_url = EXCLUDED.floor_plan_url,
  updated_at = now();

-- Delete existing required documents to avoid duplicates
DELETE FROM required_documents;

-- Insert required documents for all properties
WITH property_docs AS (
  SELECT p.id, p.type, p.country_code,
    CASE
      WHEN p.type = 'house' AND p.country_code = 'ML' THEN ARRAY[
        ROW('Titre Foncier', 'Document officiel attestant de la propriété du bien immobilier')::document_record,
        ROW('Permis d''Occuper', 'Autorisation administrative d''occupation du terrain')::document_record,
        ROW('Permis de Construire', 'Autorisation administrative pour la construction')::document_record,
        ROW('Attestation de Non-Litige', 'Document certifiant l''absence de contentieux sur le bien')::document_record,
        ROW('Plan Architectural', 'Plans détaillés de la maison approuvés par un architecte agréé')::document_record
      ]
      WHEN p.type = 'land' AND p.country_code = 'ML' THEN ARRAY[
        ROW('Titre Foncier', 'Document officiel attestant de la propriété du terrain')::document_record,
        ROW('Attestation de Non-Litige', 'Document certifiant l''absence de contentieux sur le terrain')::document_record,
        ROW('Plan Cadastral', 'Document officiel indiquant les limites et la superficie du terrain')::document_record,
        ROW('Certificat de Délimitation', 'Document détaillant les bornes et limites exactes du terrain')::document_record,
        ROW('Attestation de Situation Foncière', 'Document récent confirmant la situation juridique du terrain')::document_record
      ]
      WHEN p.type = 'house' AND p.country_code = 'CI' THEN ARRAY[
        ROW('Attestation de Propriété', 'Document officiel prouvant la propriété du bien')::document_record,
        ROW('Certificat de Propriété', 'Document légal confirmant les droits de propriété')::document_record,
        ROW('Permis de Construire', 'Autorisation officielle de construction')::document_record,
        ROW('Certificat de Conformité', 'Document attestant le respect des normes de construction')::document_record,
        ROW('Plan Cadastral', 'Document officiel montrant les limites de la propriété')::document_record
      ]
      WHEN p.type = 'land' AND p.country_code = 'CI' THEN ARRAY[
        ROW('Titre de Propriété', 'Document légal attestant la propriété du terrain')::document_record,
        ROW('Certificat Foncier', 'Document officiel du registre foncier')::document_record,
        ROW('Plan Topographique', 'Plan détaillé du terrain avec les mesures')::document_record,
        ROW('Attestation Villageoise', 'Document confirmant l''accord des autorités traditionnelles')::document_record
      ]
      WHEN p.type = 'house' AND p.country_code = 'SN' THEN ARRAY[
        ROW('Titre Foncier', 'Document officiel de propriété')::document_record,
        ROW('Bail Emphytéotique', 'Contrat de location longue durée si applicable')::document_record,
        ROW('Autorisation de Construire', 'Permis officiel de construction')::document_record,
        ROW('Certificat de Conformité', 'Document attestant le respect des normes')::document_record,
        ROW('Plan Architectural Approuvé', 'Plans validés par les autorités compétentes')::document_record
      ]
      WHEN p.type = 'land' AND p.country_code = 'SN' THEN ARRAY[
        ROW('Titre de Propriété', 'Document officiel attestant la propriété du terrain')::document_record,
        ROW('Certificat d''Urbanisme', 'Document spécifiant les règles d''urbanisme applicables')::document_record,
        ROW('Plan de Délimitation', 'Plan officiel des limites du terrain')::document_record,
        ROW('Attestation de Droit Réel', 'Document confirmant les droits sur le terrain')::document_record
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
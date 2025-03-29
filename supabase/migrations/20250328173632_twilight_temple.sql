/*
  # Add missing property details data

  1. Changes
    - Add property details for existing properties
    - Update matterport_id and floor_plan_url values
*/

-- First, let's clean up any existing property_details to avoid duplicates
DELETE FROM property_details;

-- Insert property details for all houses
WITH property_data AS (
  SELECT 
    p.id,
    p.title,
    CASE
      WHEN p.title LIKE '%Badalabougou%' THEN 350
      WHEN p.title LIKE '%Sotuba%' THEN 400
      WHEN p.title LIKE '%Cocody%' THEN 450
      WHEN p.title LIKE '%Fann%' THEN 500
      WHEN p.title LIKE '%Almadies%' THEN 550
      ELSE 400 -- Default value for other houses
    END as surface,
    CASE
      WHEN p.title LIKE '%Badalabougou%' THEN 4
      WHEN p.title LIKE '%Sotuba%' THEN 5
      WHEN p.title LIKE '%Cocody%' THEN 5
      WHEN p.title LIKE '%Fann%' THEN 6
      WHEN p.title LIKE '%Almadies%' THEN 6
      ELSE 4 -- Default value for other houses
    END as bedrooms,
    CASE
      WHEN p.title LIKE '%Badalabougou%' THEN 3
      WHEN p.title LIKE '%Sotuba%' THEN 4
      WHEN p.title LIKE '%Cocody%' THEN 4
      WHEN p.title LIKE '%Fann%' THEN 5
      WHEN p.title LIKE '%Almadies%' THEN 5
      ELSE 3 -- Default value for other houses
    END as bathrooms,
    CASE
      WHEN p.title LIKE '%Badalabougou%' THEN 'SxQL3iGyoDo'
      WHEN p.title LIKE '%Sotuba%' THEN 'Kw2QpVyR8mN'
      WHEN p.title LIKE '%Cocody%' THEN 'Rx4YPj8vKm2'
      WHEN p.title LIKE '%Fann%' THEN 'HwNjKp5vXq9'
      WHEN p.title LIKE '%Almadies%' THEN 'TzLmNx7vWs4'
      ELSE 'YpKmWx9vLs3' -- Default Matterport ID for other houses
    END as matterport_id,
    CASE
      WHEN p.title LIKE '%Badalabougou%' THEN 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
      WHEN p.title LIKE '%Sotuba%' THEN 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1200'
      WHEN p.title LIKE '%Cocody%' THEN 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200'
      WHEN p.title LIKE '%Fann%' THEN 'https://images.unsplash.com/photo-1600566752584-5af58391449f?auto=format&fit=crop&q=80&w=1200'
      WHEN p.title LIKE '%Almadies%' THEN 'https://images.unsplash.com/photo-1600566752355-35492563d8d7?auto=format&fit=crop&q=80&w=1200'
      ELSE 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200' -- Default floor plan for other houses
    END as floor_plan_url
  FROM properties p
  WHERE p.type = 'house'
)
INSERT INTO property_details (
  property_id,
  surface,
  bedrooms,
  bathrooms,
  matterport_id,
  floor_plan_url
)
SELECT
  id,
  surface,
  bedrooms,
  bathrooms,
  matterport_id,
  floor_plan_url
FROM property_data;

-- Insert property details for all lands (only surface is relevant)
INSERT INTO property_details (
  property_id,
  surface
)
SELECT
  p.id,
  CASE
    WHEN p.title LIKE '%ACI 2000%' THEN 600
    WHEN p.title LIKE '%Kalaban Coura%' THEN 400
    WHEN p.title LIKE '%Riviera%' THEN 800
    WHEN p.title LIKE '%Ngor%' THEN 1000
    WHEN p.title LIKE '%Marcory%' THEN 600
    ELSE 500 -- Default value for other lands
  END as surface
FROM properties p
WHERE p.type = 'land';
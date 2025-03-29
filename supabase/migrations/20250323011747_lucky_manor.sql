/*
  # Add property favorites

  1. New Tables
    - `property_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `property_id` (uuid, foreign key to properties)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on property_favorites table
    - Add policies for users to manage their favorites
*/

CREATE TABLE IF NOT EXISTS property_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON property_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON property_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON property_favorites
  FOR DELETE
  USING (auth.uid() = user_id);
/*
  # Fix user profiles upsert

  1. Changes
    - Add unique constraint on user_id to prevent duplicate profiles
    - Add ON CONFLICT clause to handle upserts properly
*/

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'user_profiles_user_id_key'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END
$$;
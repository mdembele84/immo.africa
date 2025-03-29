/*
  # Add query debugging function

  1. New Functions
    - `get_query_sql`: Function to get the SQL query that will be executed
    - `debug_query`: Function to get query execution plan and statistics

  2. Security
    - Functions are accessible only to authenticated users
*/

-- Function to get the SQL query
CREATE OR REPLACE FUNCTION get_query_sql(query_string text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN query_string;
END;
$$;

-- Function to get query execution plan and statistics
CREATE OR REPLACE FUNCTION debug_query(query_string text)
RETURNS TABLE (
  plan_output jsonb,
  execution_time numeric,
  rows_affected bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time timestamptz;
  end_time timestamptz;
  affected_rows bigint;
  explain_result jsonb;
BEGIN
  -- Get query plan
  EXECUTE 'EXPLAIN (FORMAT JSON) ' || query_string INTO explain_result;
  
  -- Execute query with timing
  start_time := clock_timestamp();
  EXECUTE query_string;
  end_time := clock_timestamp();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN QUERY
  SELECT 
    explain_result[0],
    EXTRACT(EPOCH FROM (end_time - start_time)) * 1000,
    affected_rows;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_query_sql TO authenticated;
GRANT EXECUTE ON FUNCTION debug_query TO authenticated;
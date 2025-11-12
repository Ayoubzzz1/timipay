-- Auto-cleanup for unverified users after 10 minutes
-- This SQL script creates a database function and trigger to automatically delete
-- unverified user records that are older than 10 minutes

-- Option 1: Using a PostgreSQL function with pg_cron extension (requires Supabase Pro)
-- This runs automatically every minute and deletes unverified users older than 10 minutes

CREATE OR REPLACE FUNCTION cleanup_unverified_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM data_user
  WHERE is_verified = false
    AND created_at < NOW() - INTERVAL '10 minutes';
END;
$$;

-- Schedule the function to run every minute (requires pg_cron extension)
-- Note: This requires Supabase Pro plan or self-hosted Supabase
-- SELECT cron.schedule('cleanup-unverified-users', '* * * * *', 'SELECT cleanup_unverified_users()');

-- Option 2: Using a database trigger (runs on every INSERT/UPDATE)
-- This is less efficient but works on all Supabase plans
-- It checks and cleans up when any operation happens on the table

CREATE OR REPLACE FUNCTION check_and_cleanup_unverified_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete unverified users older than 10 minutes
  -- Also delete their auth users if they exist
  WITH deleted_users AS (
    DELETE FROM data_user
    WHERE is_verified = false
      AND created_at < NOW() - INTERVAL '10 minutes'
    RETURNING id, email
  )
  SELECT COUNT(*) FROM deleted_users;
  
  RETURN NEW;
END;
$$;

-- Create trigger that runs on INSERT or UPDATE
-- This will clean up old unverified users whenever the table is modified
DROP TRIGGER IF EXISTS trigger_cleanup_unverified_users ON data_user;
CREATE TRIGGER trigger_cleanup_unverified_users
  AFTER INSERT OR UPDATE ON data_user
  FOR EACH STATEMENT
  EXECUTE FUNCTION check_and_cleanup_unverified_users();

-- Option 3: Manual cleanup function (can be called from Edge Function or scheduled task)
-- This is the recommended approach for Supabase Free/Pro plans
-- You can call this function from a Supabase Edge Function that runs on a schedule

CREATE OR REPLACE FUNCTION manual_cleanup_unverified_users()
RETURNS TABLE(deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_rows bigint;
BEGIN
  -- Delete unverified users older than 10 minutes
  -- Condition: is_verified = false AND created_at < now() - interval '10 minutes'
  WITH deleted AS (
    DELETE FROM data_user
    WHERE is_verified = false
      AND created_at < NOW() - INTERVAL '10 minutes'
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_rows FROM deleted;
  
  RETURN QUERY SELECT deleted_rows;
END;
$$;

-- Grant execute permission (adjust as needed for your security model)
GRANT EXECUTE ON FUNCTION manual_cleanup_unverified_users() TO authenticated;
GRANT EXECUTE ON FUNCTION manual_cleanup_unverified_users() TO anon;

-- To test the cleanup function manually:
-- SELECT * FROM manual_cleanup_unverified_users();

-- Recommended: Create a Supabase Edge Function that calls this SQL function
-- and schedule it to run every 5-10 minutes using a cron service or Supabase Edge Functions scheduler


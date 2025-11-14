// utils/pointsApi.js
// Handles all Supabase database operations for user points

import { createClient } from '@supabase/supabase-js';

// For Create React App (CRA) - use REACT_APP_ prefix
// For Vite - use VITE_ prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get current user's points from database
 * @returns {Promise<{success: boolean, points: number, error?: string}>}
 */
export const getPoints = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { success: false, points: 0, error: 'User not authenticated' };
    }

    // FIXED: Changed from 'dat_user' to 'data_user'
    const { data, error } = await supabase
      .from('data_user')
      .select('points')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching points:', error);
      return { success: false, points: 0, error: error.message };
    }

    return { 
      success: true, 
      points: data?.points || 0 
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, points: 0, error: err.message };
  }
};

/**
 * Add points to current user's balance
 * @param {number} pointsToAdd - Number of points to add
 * @param {string} source - Source of points (e.g., 'ad_watch')
 * @param {object} metadata - Additional tracking data
 * @returns {Promise<{success: boolean, points: number, error?: string}>}
 */
export const addPoints = async (pointsToAdd, source = 'ad_watch', metadata = {}) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { success: false, points: 0, error: 'User not authenticated' };
    }

    // FIXED: Changed from 'dat_user' to 'data_user'
    // Get current points
    const { data: currentData, error: fetchError } = await supabase
      .from('data_user')
      .select('points')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching current points:', fetchError);
      return { success: false, points: 0, error: fetchError.message };
    }

    const currentPoints = currentData?.points || 0;
    const newPoints = currentPoints + pointsToAdd;

    // Update points
    const { data: updatedData, error: updateError } = await supabase
      .from('data_user')
      .update({ 
        points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select('points')
      .single();

    if (updateError) {
      console.error('Error updating points:', updateError);
      return { success: false, points: currentPoints, error: updateError.message };
    }

    // Optional: Log the transaction in a separate table for analytics
    // await logPointsTransaction(user.id, pointsToAdd, source, metadata);

    console.log(`Points updated: ${currentPoints} -> ${newPoints} (+${pointsToAdd})`);
    
    return { 
      success: true, 
      points: updatedData.points,
      added: pointsToAdd
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, points: 0, error: err.message };
  }
};

/**
 * Optional: Create a points_history table for tracking
 * 
 * SQL to create the table in Supabase:
 * 
 * CREATE TABLE points_history (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id UUID REFERENCES data_user(id) ON DELETE CASCADE,
 *   points_change INTEGER NOT NULL,
 *   source TEXT NOT NULL,
 *   ad_name TEXT,
 *   seconds_watched INTEGER,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_points_history_user_id ON points_history(user_id);
 * CREATE INDEX idx_points_history_created_at ON points_history(created_at);
 */
const logPointsTransaction = async (userId, pointsChange, source, metadata) => {
  try {
    await supabase
      .from('points_history')
      .insert({
        user_id: userId,
        points_change: pointsChange,
        source: source,
        ad_name: metadata.ad_name || null,
        seconds_watched: metadata.seconds_watched || null,
        created_at: new Date().toISOString()
      });
  } catch (err) {
    console.error('Error logging points transaction:', err);
  }
};
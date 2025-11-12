// src/utils/pointsApi.js
// Utility functions for managing user points

import { supabase } from '../lib/supabaseClient';

/**
 * Points API - Secure client-side interface for points management
 * 
 * SECURITY NOTES:
 * - All operations require authentication
 * - Points are validated and logged on the backend
 * - Direct manipulation is prevented by RLS policies
 */

/**
 * Add points to the current user's account
 * @param {number} points - Number of points to add
 * @param {string} actionType - Type of action (e.g., 'video_watch', 'bonus')
 * @param {object} metadata - Additional metadata to log
 * @returns {Promise<{success: boolean, points: number, error?: string}>}
 */
export async function addPoints(points, actionType = 'video_watch', metadata = {}) {
  try {
    // Validate input
    if (typeof points !== 'number' || points <= 0) {
      throw new Error('Invalid points value');
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Call Supabase function to add points
    const { data, error } = await supabase.rpc('add_user_points', {
      p_user_id: user.id,
      p_points: points,
      p_action_type: actionType,
      p_metadata: metadata,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      const result = data[0];
      return {
        success: result.success,
        points: result.new_points,
        message: result.message,
      };
    }

    throw new Error('Unexpected response from server');
  } catch (error) {
    console.error('Error adding points:', error);
    return {
      success: false,
      points: 0,
      error: error.message,
    };
  }
}

/**
 * Get current user's points balance
 * @returns {Promise<{success: boolean, points: number, error?: string}>}
 */
export async function getPoints() {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch points from database
    const { data, error } = await supabase
      .from('data_user')
      .select('points')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return {
      success: true,
      points: data?.points || 0,
    };
  } catch (error) {
    console.error('Error getting points:', error);
    return {
      success: false,
      points: 0,
      error: error.message,
    };
  }
}

/**
 * Sync points to the backend (direct update)
 * Use this for periodic syncing from the video player
 * @param {number} newPoints - New total points value
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function syncPoints(newPoints) {
  try {
    // Validate input
    if (typeof newPoints !== 'number' || newPoints < 0) {
      throw new Error('Invalid points value');
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Update points directly
    const { error } = await supabase
      .from('data_user')
      .update({ points: newPoints })
      .eq('id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error syncing points:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get user's points history
 * @param {number} limit - Maximum number of records to fetch
 * @returns {Promise<{success: boolean, history: Array, error?: string}>}
 */
export async function getPointsHistory(limit = 50) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch history
    const { data, error } = await supabase
      .from('points_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      history: data || [],
    };
  } catch (error) {
    console.error('Error getting points history:', error);
    return {
      success: false,
      history: [],
      error: error.message,
    };
  }
}

/**
 * Get points leaderboard
 * @param {number} limit - Number of top users to fetch
 * @returns {Promise<{success: boolean, leaderboard: Array, error?: string}>}
 */
export async function getLeaderboard(limit = 10) {
  try {
    // Call Supabase function
    const { data, error } = await supabase.rpc('get_points_leaderboard', {
      limit_count: limit,
    });

    if (error) throw error;

    return {
      success: true,
      leaderboard: data || [],
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      success: false,
      leaderboard: [],
      error: error.message,
    };
  }
}

/**
 * Subscribe to real-time points updates
 * @param {string} userId - User ID to subscribe to
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToPointsUpdates(userId, callback) {
  const subscription = supabase
    .channel(`points:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'data_user',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new && typeof payload.new.points === 'number') {
          callback(payload.new.points);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
}

export default {
  addPoints,
  getPoints,
  syncPoints,
  getPointsHistory,
  getLeaderboard,
  subscribeToPointsUpdates,
};

import { supabase } from '../lib/supabaseClient';

/**
 * Save points to user_points table and create history entry
 * @param {string} userId - User ID
 * @param {number} pointsToAdd - Points to add (default: 1)
 * @param {string} actionType - Action type (default: 'ad_watch')
 * @param {string} description - Description (default: 'User watched an ad')
 * @returns {Promise<{success: boolean, totalPoints: number, error: Error|null}>}
 */
export const savePoints = async (userId, pointsToAdd = 1, actionType = 'ad_watch', description = 'User watched an ad') => {
  if (!userId || pointsToAdd <= 0) {
    return { success: false, totalPoints: 0, error: new Error('Invalid userId or points') };
  }

  try {
    // First, get or create user_points record
    const { data: existingPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    let newTotalPoints = pointsToAdd;
    
    if (existingPoints) {
      newTotalPoints = Number(existingPoints.total_points) + Number(pointsToAdd);
      
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          total_points: newTotalPoints,
          total_ads_watched: (existingPoints.total_ads_watched || 0) + 1,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user_points:', updateError);
        throw updateError;
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('user_points')
        .insert({
          user_id: userId,
          total_points: newTotalPoints,
          total_ads_watched: 1,
          last_updated: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating user_points:', insertError);
        throw insertError;
      }
    }

    // Create history entry
    const { error: historyError } = await supabase
      .from('points_history')
      .insert({
        user_id: userId,
        points_added: Number(pointsToAdd),
        action_type: actionType,
        description: description,
        created_at: new Date().toISOString(),
      });

    if (historyError) {
      console.error('Error creating points_history:', historyError);
      // Don't throw, just log - points are already saved
    }

    return { success: true, totalPoints: newTotalPoints, error: null };
  } catch (error) {
    console.error('Error saving points:', error);
    return { success: false, totalPoints: 0, error };
  }
};

/**
 * Get user's total points from user_points table
 * @param {string} userId - User ID
 * @returns {Promise<{points: number, adsWatched: number, error: Error|null}>}
 */
export const getUserPoints = async (userId) => {
  if (!userId) {
    return { points: 0, adsWatched: 0, error: new Error('Invalid userId') };
  }

  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user points:', error);
      return { points: 0, adsWatched: 0, error };
    }

    const points = data?.total_points || 0;
    const adsWatched = data?.total_ads_watched || 0;

    return { points: Number(points), adsWatched: Number(adsWatched), error: null };
  } catch (error) {
    console.error('Exception fetching user points:', error);
    return { points: 0, adsWatched: 0, error };
  }
};

/**
 * Get user's points history
 * @param {string} userId - User ID
 * @param {number} limit - Limit number of records (default: 50)
 * @returns {Promise<{history: Array, error: Error|null}>}
 */
export const getPointsHistory = async (userId, limit = 50) => {
  if (!userId) {
    return { history: [], error: new Error('Invalid userId') };
  }

  try {
    const { data, error } = await supabase
      .from('points_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching points history:', error);
      return { history: [], error };
    }

    return { history: data || [], error: null };
  } catch (error) {
    console.error('Exception fetching points history:', error);
    return { history: [], error };
  }
};


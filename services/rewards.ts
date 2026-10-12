import { supabase } from '@/services/supabase';

/**
 * Calls backend to grant 2 reward credits after user finishes a rewarded ad.
 */
export const handleAddRewardCredits = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return false;
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/profiles/add-reward-credits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    return response.ok;
  } catch (e) {
    console.error('Failed to add reward credits:', e);
    return false;
  }
};

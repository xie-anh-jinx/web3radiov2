
// Backend API service for W3R rewards - Migrated to Express API + PostgreSQL
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

export interface ListeningSession {
  userAddress: string;
  startTime: string;
  endTime: string;
  duration: number;
  stationId?: string;
}

export interface RewardClaim {
  userAddress: string;
  listeningTime: number;
  rewardAmount: string;
  signature: string;
  nonce: number;
}

export class W3RBackendApi {
  private static instance: W3RBackendApi;

  public static getInstance(): W3RBackendApi {
    if (!W3RBackendApi.instance) {
      W3RBackendApi.instance = new W3RBackendApi();
    }
    return W3RBackendApi.instance;
  }

  // Submit listening session for verification
  async submitListeningSession(session: ListeningSession): Promise<{ success: boolean; verifiedTime: number; sessionId?: string }> {
    try {
      console.log('Submitting listening session:', session);

      const response = await fetch(`${API_URL}/api/rewards/submit_session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit session');
      }

      console.log('Session submitted successfully:', data);
      return {
        success: data?.success || false,
        verifiedTime: data?.verifiedTime || 0,
        sessionId: data?.sessionId
      };
    } catch (error) {
      console.error('Error submitting listening session:', error);
      return { success: false, verifiedTime: 0 };
    }
  }

  // Get verified listening time for user
  async getVerifiedListeningTime(userAddress: string): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/api/rewards/listening_time/${userAddress}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get listening time');
      }

      return data?.totalListeningTime || 0;
    } catch (error) {
      console.error('Error getting verified listening time:', error);
      return 0;
    }
  }

  // Request reward claim signature
  async requestRewardSignature(userAddress: string): Promise<RewardClaim | null> {
    try {
      const response = await fetch(`${API_URL}/api/rewards/claim_reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request signature');
      }

      return data || null;
    } catch (error) {
      console.error('Error requesting reward signature:', error);
      return null;
    }
  }

  // Verify user eligibility for rewards
  async checkRewardEligibility(userAddress: string): Promise<{
    eligible: boolean;
    nextRewardIn: number;
    availableRewards: number;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/rewards/eligibility/${userAddress}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check eligibility');
      }

      return data || { eligible: false, nextRewardIn: 0, availableRewards: 0 };
    } catch (error) {
      console.error('Error checking reward eligibility:', error);
      return { eligible: false, nextRewardIn: 0, availableRewards: 0 };
    }
  }
}

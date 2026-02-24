import BaseApiService, { ApiResponse } from './BaseApiService';

// ============================================================================
// LOYALTY API TYPES
// ============================================================================

export type LoyaltyTier = 'none' | 'silver' | 'gold' | 'platinum';

export interface CustomerLoyaltyProfile {
  id: string;
  tier: LoyaltyTier;
  credit_balance: number;
  total_completed_trips: number;
  monthly_trip_count: number;
  referral_code: string;
  referred_by?: string;
  discount_percentage: number;
  is_priority_customer: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  customer_email: string;
  amount: number;
  transaction_type: string;
  booking_reference?: string;
  description: string;
  created_at: string;
}

export interface ReferralEvent {
  id: string;
  referrer_email: string;
  referred_email: string;
  status: 'pending' | 'completed' | 'rewarded';
  referral_booking_reference?: string;
  reward_credited_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplyCreditsRequest {
  booking_id: string;
  credits_to_apply: number;
}

export interface ApplyCreditsResponse {
  booking_id: string;
  credits_applied: number;
  remaining_balance: number;
}

// ============================================================================
// LOYALTY API SERVICE
// ============================================================================

class LoyaltyApiService {
  private basePath = '/loyalty';

  /**
   * Get Loyalty Profile
   * GET /api/v1/loyalty/profile/
   */
  async getProfile(): Promise<ApiResponse<CustomerLoyaltyProfile>> {
    try {
      return await BaseApiService.get<CustomerLoyaltyProfile>(`${this.basePath}/profile/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch loyalty profile',
      };
    }
  }

  /**
   * Get Credit Transactions
   * GET /api/v1/loyalty/transactions/
   */
  async getTransactions(): Promise<ApiResponse<CreditTransaction[]>> {
    try {
      const response = await BaseApiService.get<CreditTransaction[] | { results: CreditTransaction[] }>(
        `${this.basePath}/transactions/`
      );
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : (response.data as any).results || [];
        return { ...response, data };
      }
      return response as ApiResponse<CreditTransaction[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      };
    }
  }

  /**
   * Get Referrals
   * GET /api/v1/loyalty/referrals/
   */
  async getReferrals(): Promise<ApiResponse<ReferralEvent[]>> {
    try {
      const response = await BaseApiService.get<ReferralEvent[] | { results: ReferralEvent[] }>(
        `${this.basePath}/referrals/`
      );
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : (response.data as any).results || [];
        return { ...response, data };
      }
      return response as ApiResponse<ReferralEvent[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch referrals',
      };
    }
  }

  /**
   * Apply Credits to Booking
   * POST /api/v1/loyalty/apply-credits/submit
   */
  async applyCredits(data: ApplyCreditsRequest): Promise<ApiResponse<ApplyCreditsResponse>> {
    try {
      return await BaseApiService.post<ApplyCreditsResponse>(
        `${this.basePath}/apply-credits/submit`,
        data
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply credits',
      };
    }
  }

  /**
   * Returns the hex color for a given loyalty tier.
   */
  getTierColor(tier: LoyaltyTier): string {
    switch (tier) {
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return '#9CA3AF';
    }
  }

  /**
   * Returns the display label for a given loyalty tier.
   */
  getTierLabel(tier: LoyaltyTier): string {
    if (!tier || tier === 'none') return 'None';
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }

  /**
   * Maps a transaction_type string to a human-readable label.
   */
  getTransactionTypeLabel(transactionType: string): string {
    const map: Record<string, string> = {
      referral_reward: 'Referral Reward',
      redemption: 'Redeemed on Ride',
      credit: 'Credit Added',
      debit: 'Deducted',
      signup_bonus: 'Sign-up Bonus',
      trip_reward: 'Trip Reward',
    };
    return map[transactionType] || transactionType.replace(/_/g, ' ');
  }
}

export default new LoyaltyApiService();

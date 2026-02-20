import BaseApiService, { ApiResponse } from './BaseApiService';

// ============================================================================
// INSURANCE TYPES
// ============================================================================

/**
 * Insurance Tier Types
 */
export type InsuranceTier = 'scratch' | 'scratch_and_dent' | 'full';

/**
 * Insurance Plan from API
 */
export interface InsurancePlan {
  id: string;
  tier: InsuranceTier;
  name: string;
  description: string;
  premium_amount: string;
  max_coverage_amount: string;
  coverage_details: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// INSURANCE API SERVICE
// ============================================================================

class InsuranceApiService {
  private basePath = '/insurance';

  /**
   * List Insurance Plans
   * GET /api/v1/insurance/plans/
   *
   * Get all available insurance plans for trip coverage.
   */
  async listPlans(): Promise<ApiResponse<InsurancePlan[]>> {
    try {
      const response = await BaseApiService.get<InsurancePlan[]>(`${this.basePath}/plans/`);

      if (response.success && response.data) {
        // Handle both array and nested data responses
        const plans = Array.isArray(response.data)
          ? response.data
          : (response.data as any).results || (response.data as any).plans || [];

        // Sort by display_order
        const sortedPlans = plans.sort((a: InsurancePlan, b: InsurancePlan) =>
          a.display_order - b.display_order
        );

        return {
          success: true,
          data: sortedPlans,
        };
      }

      return response as ApiResponse<InsurancePlan[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch insurance plans',
      };
    }
  }

  /**
   * Get Insurance Plan Details
   * GET /api/v1/insurance/plans/{id}/
   *
   * Get detailed information about a specific insurance plan.
   *
   * @param id - The insurance plan ID
   */
  async getPlanDetails(id: string): Promise<ApiResponse<InsurancePlan>> {
    try {
      return await BaseApiService.get<InsurancePlan>(`${this.basePath}/plans/${id}/`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch insurance plan details',
      };
    }
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  /**
   * Parse string amount to number
   */
  parseAmount(amount: string | number | undefined): number {
    if (amount === undefined || amount === null) return 0;
    if (typeof amount === 'number') return amount;
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Get display name for insurance tier
   */
  getTierDisplayName(tier: InsuranceTier): string {
    const tierNames: Record<InsuranceTier, string> = {
      scratch: 'Scratch Coverage',
      scratch_and_dent: 'Scratch & Dent Coverage',
      full: 'Full Coverage',
    };
    return tierNames[tier] || 'Insurance Coverage';
  }

  /**
   * Get short description for insurance tier
   */
  getTierDescription(tier: InsuranceTier): string {
    const tierDescriptions: Record<InsuranceTier, string> = {
      scratch: 'Basic protection for minor scratches and paint touch-ups',
      scratch_and_dent: 'Enhanced protection for common scratches and dents',
      full: 'Comprehensive coverage for scratches, dents, and all minor damage during your trip',
    };
    return tierDescriptions[tier] || 'Trip insurance coverage';
  }

  /**
   * Get color code for insurance tier (for UI theming)
   */
  getTierColor(tier: InsuranceTier): { bg: string; border: string; text: string } {
    const tierColors: Record<InsuranceTier, { bg: string; border: string; text: string }> = {
      scratch: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
      },
      scratch_and_dent: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-500',
        text: 'text-green-600 dark:text-green-400',
      },
      full: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-500',
        text: 'text-purple-600 dark:text-purple-400',
      },
    };
    return tierColors[tier] || { bg: 'bg-gray-50', border: 'border-gray-500', text: 'text-gray-600' };
  }

  /**
   * Check if plan is recommended (typically the middle tier)
   */
  isRecommendedPlan(plan: InsurancePlan, allPlans: InsurancePlan[]): boolean {
    // Sort by display order and mark the middle one as recommended
    const sorted = [...allPlans].sort((a, b) => a.display_order - b.display_order);
    const middleIndex = Math.floor(sorted.length / 2);
    return sorted[middleIndex]?.id === plan.id;
  }

  /**
   * Format coverage amount for display (e.g., 50000 -> ₹50,000)
   */
  formatCoverageAmount(amount: string | number): string {
    const num = this.parseAmount(amount);
    return `₹${num.toLocaleString('en-IN')}`;
  }

  /**
   * Format premium amount for display
   */
  formatPremiumAmount(amount: string | number): string {
    const num = this.parseAmount(amount);
    return `₹${num}`;
  }
}

export default new InsuranceApiService();

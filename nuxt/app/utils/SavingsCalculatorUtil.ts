// Internal imports
import type { SavingsProjectionInterface } from '~/interfaces/SavingsProjectionInterface';

// Exports
export class SavingsCalculatorUtil {
  /**
   * Projects the savings with monthly compounding; each contribution is made at the end of the
   * month, so it starts earning interest the following month.
   */
  public static calculateProjection(
    monthlyContribution: number,
    annualRatePercent: number,
    months: number,
  ): SavingsProjectionInterface {
    const monthlyRate = annualRatePercent / 100 / 12;
    let balance = 0;
    for (let month = 0; month < months; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
    }
    const totalContributed = monthlyContribution * months;
    return {
      totalContributed,
      totalInterest: balance - totalContributed,
      finalBalance: balance,
    };
  }
}

import { BaseStrategy, Candle, SignalResult } from "./base";
import { CustomStrategy, Condition } from "../custom-strategy-storage";

/**
 * Custom Strategy Executor
 * Interprets and executes user-defined custom strategies
 */
export class CustomStrategyExecutor extends BaseStrategy {
  private customStrategy: CustomStrategy;

  constructor(customStrategy: CustomStrategy) {
    super({
      name: customStrategy.name,
      description: customStrategy.description,
      parameters: [],
    });
    this.customStrategy = customStrategy;
  }

  /**
   * Evaluate a single condition against market data
   */
  private evaluateCondition(
    condition: Condition,
    data: Candle[],
    currentIndex: number
  ): boolean {
    const { indicator1, indicator2, operator } = condition;

    // Get indicator values
    const value1 = this.getIndicatorValue(
      indicator1.type,
      indicator1.period,
      data,
      currentIndex
    );
    const value2 = this.getIndicatorValue(
      indicator2.type,
      indicator2.period,
      data,
      currentIndex
    );

    if (value1 === null || value2 === null) {
      return false;
    }

    // Evaluate operator
    switch (operator) {
      case ">":
        return value1 > value2;
      case "<":
        return value1 < value2;
      case ">=":
        return value1 >= value2;
      case "<=":
        return value1 <= value2;
      case "==":
        return Math.abs(value1 - value2) < 0.01; // Approximate equality for floats
      case "crosses_above":
        // Check if indicator1 crossed above indicator2
        if (currentIndex === 0) return false;
        const prevValue1 = this.getIndicatorValue(
          indicator1.type,
          indicator1.period,
          data,
          currentIndex - 1
        );
        const prevValue2 = this.getIndicatorValue(
          indicator2.type,
          indicator2.period,
          data,
          currentIndex - 1
        );
        if (prevValue1 === null || prevValue2 === null) return false;
        return prevValue1 <= prevValue2 && value1 > value2;
      case "crosses_below":
        // Check if indicator1 crossed below indicator2
        if (currentIndex === 0) return false;
        const prevVal1 = this.getIndicatorValue(
          indicator1.type,
          indicator1.period,
          data,
          currentIndex - 1
        );
        const prevVal2 = this.getIndicatorValue(
          indicator2.type,
          indicator2.period,
          data,
          currentIndex - 1
        );
        if (prevVal1 === null || prevVal2 === null) return false;
        return prevVal1 >= prevVal2 && value1 < value2;
      default:
        return false;
    }
  }

  /**
   * Get indicator value at a specific index
   */
  private getIndicatorValue(
    type: string,
    period: number,
    data: Candle[],
    currentIndex: number
  ): number | null {
    if (currentIndex < period - 1) {
      return null;
    }

    const slice = data.slice(0, currentIndex + 1);
    const prices = slice.map((d) => d.close);

    switch (type) {
      case "SMA":
        const sma = this.calculateSMA(prices, period);
        return sma[sma.length - 1] ?? null;
      case "EMA":
        const ema = this.calculateEMA(prices, period);
        return ema[ema.length - 1] ?? null;
      case "RSI":
        const rsi = this.calculateRSI(prices, period);
        return rsi[rsi.length - 1] ?? null;
      case "Price":
        return data[currentIndex].close;
      default:
        return null;
    }
  }

  /**
   * Evaluate all conditions with AND logic
   */
  private evaluateConditions(
    conditions: Condition[],
    data: Candle[],
    currentIndex: number
  ): boolean {
    if (conditions.length === 0) {
      return false;
    }

    // All conditions must be true (AND logic)
    return conditions.every((condition) =>
      this.evaluateCondition(condition, data, currentIndex)
    );
  }

  /**
   * Generate trading signals based on custom rules
   */
  generateSignals(data: Candle[]): SignalResult[] {
    console.log(
      `[CUSTOM_STRATEGY] Generating signals for: ${this.customStrategy.name}`
    );

    const results: SignalResult[] = [];
    const maxPeriod = this.getMaxPeriod();
    let currentPosition = 0; // 0 = no position, 1 = long

    for (let i = 0; i < data.length; i++) {
      const candle = data[i];
      let signal = currentPosition;
      let position = 0; // Default: hold

      if (i >= maxPeriod) {
        const buySignal = this.evaluateConditions(
          this.customStrategy.buyRules,
          data,
          i
        );
        const sellSignal = this.evaluateConditions(
          this.customStrategy.sellRules,
          data,
          i
        );

        if (buySignal && currentPosition === 0) {
          signal = 1;
          position = 1; // Buy
          currentPosition = 1;
          console.log(`[CUSTOM_STRATEGY] Buy signal at index ${i}`);
        } else if (sellSignal && currentPosition === 1) {
          signal = 0;
          position = -1; // Sell
          currentPosition = 0;
          console.log(`[CUSTOM_STRATEGY] Sell signal at index ${i}`);
        } else {
          signal = currentPosition;
          position = 0; // Hold
        }
      }

      results.push({
        date: candle.date,
        close: candle.close,
        signal,
        position,
      });
    }

    const signalCount = results.filter((r) => r.position !== 0).length;
    console.log(`[CUSTOM_STRATEGY] Generated ${signalCount} signals`);
    return results;
  }

  /**
   * Get the maximum period required for all indicators
   */
  private getMaxPeriod(): number {
    const allConditions = [
      ...this.customStrategy.buyRules,
      ...this.customStrategy.sellRules,
    ];

    let maxPeriod = 0;
    for (const condition of allConditions) {
      maxPeriod = Math.max(
        maxPeriod,
        condition.indicator1.period,
        condition.indicator2.period
      );
    }

    return maxPeriod;
  }
}

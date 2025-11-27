// Base Strategy Interface
export interface Candle {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SignalResult {
  date: Date;
  close: number;
  signal: number; // 0 = no position, 1 = long
  position: number; // -1 = sell, 0 = hold, 1 = buy
  indicators?: Record<string, number>; // Store indicator values for display
}

export interface StrategyConfig {
  name: string;
  description: string;
  parameters: StrategyParameter[];
}

export interface StrategyParameter {
  name: string;
  label: string;
  type: "number" | "select";
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string | number; label: string }>;
  description?: string;
}

export abstract class BaseStrategy {
  protected config: StrategyConfig;

  constructor(config: StrategyConfig) {
    this.config = config;
  }

  /**
   * Get strategy configuration
   */
  getConfig(): StrategyConfig {
    return this.config;
  }

  /**
   * Generate trading signals from historical data
   * @param data - Array of candle data
   * @param params - Strategy parameters (optional)
   * @returns Array of signal results
   */
  abstract generateSignals(
    data: Candle[],
    params?: Record<string, number | string>
  ): SignalResult[];

  /**
   * Calculate Simple Moving Average
   */
  protected calculateSMA(data: number[], window: number): number[] {
    const sma: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        sma.push(NaN);
        continue;
      }
      const slice = data.slice(i - window + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      sma.push(sum / window);
    }
    return sma;
  }

  /**
   * Calculate Exponential Moving Average
   */
  protected calculateEMA(data: number[], window: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (window + 1);

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema.push(data[i]);
      } else if (i < window) {
        // Use SMA for initial values
        const slice = data.slice(0, i + 1);
        const sum = slice.reduce((a, b) => a + b, 0);
        ema.push(sum / (i + 1));
      } else {
        const value = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
        ema.push(value);
      }
    }
    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  protected calculateRSI(data: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        rsi.push(NaN);
        gains.push(0);
        losses.push(0);
        continue;
      }

      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);

      if (i < period) {
        rsi.push(NaN);
        continue;
      }

      let avgGain: number, avgLoss: number;

      if (i === period) {
        // First RSI calculation
        avgGain =
          gains.slice(1, period + 1).reduce((a, b) => a + b, 0) / period;
        avgLoss =
          losses.slice(1, period + 1).reduce((a, b) => a + b, 0) / period;
      } else {
        // Smoothed RSI
        const prevAvgGain = gains[i - 1] / period;
        const prevAvgLoss = losses[i - 1] / period;
        avgGain = (prevAvgGain * (period - 1) + gains[i]) / period;
        avgLoss = (prevAvgLoss * (period - 1) + losses[i]) / period;
      }

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }

    return rsi;
  }

  /**
   * Calculate Bollinger Bands
   */
  protected calculateBollingerBands(
    data: number[],
    period: number = 20,
    stdDev: number = 2
  ): { upper: number[]; middle: number[]; lower: number[] } {
    const middle = this.calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
        continue;
      }

      const slice = data.slice(i - period + 1, i + 1);
      const mean = middle[i];
      const variance =
        slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const sd = Math.sqrt(variance);

      upper.push(mean + stdDev * sd);
      lower.push(mean - stdDev * sd);
    }

    return { upper, middle, lower };
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  protected calculateMACD(
    data: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): { macd: number[]; signal: number[]; histogram: number[] } {
    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);

    const macd: number[] = [];
    for (let i = 0; i < data.length; i++) {
      macd.push(fastEMA[i] - slowEMA[i]);
    }

    const signal = this.calculateEMA(macd, signalPeriod);
    const histogram: number[] = [];

    for (let i = 0; i < data.length; i++) {
      histogram.push(macd[i] - signal[i]);
    }

    return { macd, signal, histogram };
  }

  /**
   * Convert position changes to buy/sell signals
   */
  protected positionsToSignals(signals: number[]): number[] {
    const positions: number[] = [];
    for (let i = 0; i < signals.length; i++) {
      if (i === 0) {
        positions.push(0);
      } else {
        positions.push(signals[i] - signals[i - 1]);
      }
    }
    return positions;
  }
}

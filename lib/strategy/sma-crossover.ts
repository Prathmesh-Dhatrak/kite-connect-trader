import { BaseStrategy, Candle, SignalResult, StrategyConfig } from "./base";

export class SMACrossoverStrategy extends BaseStrategy {
  constructor() {
    const config: StrategyConfig = {
      name: "SMA Crossover",
      description:
        "Buy when short-term SMA crosses above long-term SMA, sell when it crosses below",
      parameters: [
        {
          name: "short_window",
          label: "Short Window",
          type: "number",
          default: 20,
          min: 5,
          max: 100,
          step: 1,
          description: "Period for short-term moving average",
        },
        {
          name: "long_window",
          label: "Long Window",
          type: "number",
          default: 50,
          min: 20,
          max: 200,
          step: 1,
          description: "Period for long-term moving average",
        },
      ],
    };
    super(config);
  }

  generateSignals(
    data: Candle[],
    params: Record<string, number | string>
  ): SignalResult[] {
    const shortWindow = params.short_window || 20;
    const longWindow = params.long_window || 50;

    console.log("[SMA_STRATEGY] Generating signals...");
    console.log("[SMA_STRATEGY] Short window:", shortWindow);
    console.log("[SMA_STRATEGY] Long window:", longWindow);
    console.log("[SMA_STRATEGY] Data points:", data.length);

    const closes = data.map((d) => d.close);
    const shortSMA = this.calculateSMA(closes, shortWindow);
    const longSMA = this.calculateSMA(closes, longWindow);

    const signals: SignalResult[] = [];
    const rawSignals: number[] = [];

    for (let i = 0; i < data.length; i++) {
      let signal = 0;

      if (i >= longWindow - 1 && !isNaN(shortSMA[i]) && !isNaN(longSMA[i])) {
        signal = shortSMA[i] > longSMA[i] ? 1 : 0;
      }

      rawSignals.push(signal);
    }

    const positions = this.positionsToSignals(rawSignals);

    for (let i = 0; i < data.length; i++) {
      signals.push({
        date: data[i].date,
        close: data[i].close,
        signal: rawSignals[i],
        position: positions[i],
        indicators: {
          short_sma: shortSMA[i],
          long_sma: longSMA[i],
        },
      });
    }

    const buySignals = signals.filter((s) => s.position === 1).length;
    const sellSignals = signals.filter((s) => s.position === -1).length;

    console.log("[SMA_STRATEGY] BUY signals:", buySignals);
    console.log("[SMA_STRATEGY] SELL signals:", sellSignals);

    return signals;
  }
}
